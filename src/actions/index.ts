import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'zod';
import sharp from 'sharp';
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  checkCredentials,
  createCsrfValue,
  createSessionToken,
  sessionCookieOptions,
  verifyCsrfValue,
  verifySessionToken,
} from '../lib/auth';
import { getDatabase } from '../lib/db/client';
import { ValidationError } from '../lib/db/errors';
import {
  createCategory,
  createPlan,
  deleteCategory,
  deletePlan,
  setCategoryActive,
  setPlanActive,
  updateCategory,
  updatePlan,
} from '../lib/db/repositories/plans';
import { createNews, deleteNews, setNewsActive, updateNews } from '../lib/db/repositories/news';
import {
  createTutorial,
  createTutorialCategory,
  deleteTutorial,
  deleteTutorialCategory,
  setTutorialActive,
  updateTutorial,
  updateTutorialCategory,
} from '../lib/db/repositories/tutorials';
import {
  createPortfolioItem,
  deletePortfolioItem,
  setPortfolioActive,
  updatePortfolioItem,
} from '../lib/db/repositories/portfolio';
import {
  createCommunityRadio,
  deleteCommunityRadio,
  setCommunityActive,
  updateCommunityRadio,
} from '../lib/db/repositories/community';
import { SOCIAL_KEYS, setSetting, setSocialLinks } from '../lib/db/repositories/settings';
import { SEO_KEYS } from '../lib/seo';
import { slugify } from '../lib/utils/slug';

function optionalText() {
  return z.preprocess((value) => (value === '' || value == null ? undefined : value), z.string().optional());
}

function optionalNumber() {
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.coerce.number().optional(),
  );
}

const intent = z.enum(['create', 'update', 'delete', 'toggle']);
const baseFields = {
  csrf: z.string().optional(),
  intent,
  id: optionalNumber(),
  isActive: z.boolean().optional(),
};

function guard(context: ActionAPIContext, csrf: unknown): void {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, context.request.headers.get('user-agent'));
  if (!session) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sesión no válida' });
  }
  if (!verifyCsrfValue(context.cookies.get(CSRF_COOKIE)?.value, csrf)) {
    throw new ActionError({ code: 'FORBIDDEN', message: 'Token de seguridad inválido' });
  }
}

function fail(error: unknown): never {
  if (error instanceof ValidationError) {
    throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
  }
  throw error;
}

function prune<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

async function processImage(file: unknown, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
  if (!allowed.includes(file.type)) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Formato de imagen no permitido (usa PNG, JPG, WebP o AVIF)' });
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'La imagen supera el máximo de 5 MB' });
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base = slugify(file.name.replace(/\.[^.]+$/, '')) || prefix;
    const filename = `${prefix}-${base}-${Date.now()}.webp`;
    const destination = join(resolve(process.env.UPLOADS_DIR ?? './uploads'), 'admin', filename);
    await mkdir(dirname(destination), { recursive: true });
    await sharp(buffer).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toFile(destination);
    return `/uploads/admin/${filename}`;
  } catch (error) {
    if (error instanceof ActionError) throw error;
    throw new ActionError({ code: 'BAD_REQUEST', message: 'No se pudo procesar la imagen' });
  }
}

const fileField = z.instanceof(File).optional();

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({ username: z.string(), password: z.string() }),
    handler: async ({ username, password }, context) => {
      if (!checkCredentials(username, password)) {
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'Usuario o contraseña incorrectos' });
      }
      context.cookies.set(
        SESSION_COOKIE,
        createSessionToken(context.request.headers.get('user-agent')),
        sessionCookieOptions(),
      );
      context.cookies.set(CSRF_COOKIE, createCsrfValue(), sessionCookieOptions());
      return { ok: true };
    },
  }),

  plan: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      planKey: optionalText(),
      planName: optionalText(),
      price: optionalNumber(),
      title: optionalText(),
      description: optionalText(),
      features: optionalText(),
      monthlyPrice: optionalNumber(),
      annualPrice: optionalNumber(),
      usdPrice: optionalNumber(),
      billingNote: optionalText(),
      demoUrl: optionalText(),
      categoryId: optionalNumber(),
      imageUrl: optionalText(),
      image: fileField,
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deletePlan(db, input.id);
          return { ok: true, message: 'Plan eliminado' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setPlanActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const uploaded = await processImage(input.image, 'plan');
        const data = prune({
          planKey: input.planKey,
          planName: input.planName,
          price: input.price,
          title: input.title ?? null,
          description: input.description ?? null,
          features: input.features ? input.features.split('\n').map((line) => line.trim()).filter(Boolean) : [],
          monthlyPrice: input.monthlyPrice ?? null,
          annualPrice: input.annualPrice ?? null,
          usdPrice: input.usdPrice ?? null,
          billingNote: input.billingNote ?? null,
          demoUrl: input.demoUrl ?? null,
          categoryId: input.categoryId ?? null,
          imageUrl: uploaded ?? input.imageUrl ?? null,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updatePlan(db, input.id, data);
          return { ok: true, message: 'Plan actualizado' };
        }
        createPlan(db, data as Parameters<typeof createPlan>[1]);
        return { ok: true, message: 'Plan creado' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  planCategory: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      name: optionalText(),
      slug: optionalText(),
      description: optionalText(),
      icon: optionalText(),
      displayOrder: optionalNumber(),
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deleteCategory(db, input.id);
          return { ok: true, message: 'Categoría eliminada' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setCategoryActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const data = prune({
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          icon: input.icon ?? null,
          displayOrder: input.displayOrder ?? 0,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updateCategory(db, input.id, data);
          return { ok: true, message: 'Categoría actualizada' };
        }
        createCategory(db, data as Parameters<typeof createCategory>[1]);
        return { ok: true, message: 'Categoría creada' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  news: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      title: optionalText(),
      slug: optionalText(),
      excerpt: optionalText(),
      content: optionalText(),
      author: optionalText(),
      publishedAt: optionalText(),
      imageUrl: optionalText(),
      image: fileField,
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deleteNews(db, input.id);
          return { ok: true, message: 'Noticia eliminada' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setNewsActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const uploaded = await processImage(input.image, 'noticia');
        const data = prune({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt ?? null,
          content: input.content,
          author: input.author ?? 'IPStream',
          publishedAt: input.publishedAt,
          image: uploaded ?? input.imageUrl ?? null,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updateNews(db, input.id, data);
          return { ok: true, message: 'Noticia actualizada' };
        }
        createNews(db, data as Parameters<typeof createNews>[1]);
        return { ok: true, message: 'Noticia creada' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  tutorialCategory: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      name: optionalText(),
      slug: optionalText(),
      color: optionalText(),
      displayOrder: optionalNumber(),
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deleteTutorialCategory(db, input.id);
          return { ok: true, message: 'Categoría eliminada' };
        }
        const data = prune({
          name: input.name,
          slug: input.slug,
          color: input.color ?? 'blue',
          displayOrder: input.displayOrder ?? 0,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updateTutorialCategory(db, input.id, data);
          return { ok: true, message: 'Categoría actualizada' };
        }
        createTutorialCategory(db, data as Parameters<typeof createTutorialCategory>[1]);
        return { ok: true, message: 'Categoría creada' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  tutorial: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      categoryId: optionalNumber(),
      title: optionalText(),
      slug: optionalText(),
      description: optionalText(),
      videoUrl: optionalText(),
      duration: optionalText(),
      difficulty: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.enum(['beginner', 'intermediate', 'advanced']).optional()),
      displayOrder: optionalNumber(),
      views: optionalNumber(),
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deleteTutorial(db, input.id);
          return { ok: true, message: 'Tutorial eliminado' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setTutorialActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const data = prune({
          categoryId: input.categoryId,
          title: input.title,
          slug: input.slug,
          description: input.description ?? null,
          videoUrl: input.videoUrl ?? null,
          duration: input.duration ?? null,
          difficulty: input.difficulty ?? 'beginner',
          displayOrder: input.displayOrder ?? 0,
          views: input.views ?? 0,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updateTutorial(db, input.id, data);
          return { ok: true, message: 'Tutorial actualizado' };
        }
        createTutorial(db, data as Parameters<typeof createTutorial>[1]);
        return { ok: true, message: 'Tutorial creado' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  portfolio: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      title: optionalText(),
      slug: optionalText(),
      description: optionalText(),
      projectUrl: optionalText(),
      displayOrder: optionalNumber(),
      imageUrl: optionalText(),
      image: fileField,
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deletePortfolioItem(db, input.id);
          return { ok: true, message: 'Cliente eliminado' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setPortfolioActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const uploaded = await processImage(input.image, 'cliente');
        const data = prune({
          title: input.title,
          slug: input.slug,
          description: input.description ?? null,
          projectUrl: input.projectUrl ?? null,
          displayOrder: input.displayOrder ?? 0,
          imageUrl: uploaded ?? input.imageUrl ?? null,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updatePortfolioItem(db, input.id, data);
          return { ok: true, message: 'Cliente actualizado' };
        }
        createPortfolioItem(db, data as Parameters<typeof createPortfolioItem>[1]);
        return { ok: true, message: 'Cliente creado' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  community: defineAction({
    accept: 'form',
    input: z.object({
      ...baseFields,
      name: optionalText(),
      slug: optionalText(),
      description: optionalText(),
      siteUrl: optionalText(),
      displayOrder: optionalNumber(),
      logoUrl: optionalText(),
      image: fileField,
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      try {
        if (input.intent === 'delete') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          deleteCommunityRadio(db, input.id);
          return { ok: true, message: 'Radio eliminada' };
        }
        if (input.intent === 'toggle') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          setCommunityActive(db, input.id, Boolean(input.isActive));
          return { ok: true, message: 'Estado actualizado' };
        }
        const uploaded = await processImage(input.image, 'comunidad');
        const data = prune({
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          siteUrl: input.siteUrl,
          displayOrder: input.displayOrder ?? 0,
          logoUrl: uploaded ?? input.logoUrl ?? null,
          isActive: input.isActive ?? true,
        });
        if (input.intent === 'update') {
          if (!input.id) throw new ValidationError('Falta el identificador');
          updateCommunityRadio(db, input.id, data);
          return { ok: true, message: 'Radio actualizada' };
        }
        createCommunityRadio(db, data as Parameters<typeof createCommunityRadio>[1]);
        return { ok: true, message: 'Radio creada' };
      } catch (error) {
        return fail(error);
      }
    },
  }),

  settings: defineAction({
    accept: 'form',
    input: z.object({
      csrf: z.string().optional(),
      social_facebook: optionalText(),
      social_twitter: optionalText(),
      social_instagram: optionalText(),
      social_youtube: optionalText(),
      social_tiktok: optionalText(),
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      const links: Partial<Record<(typeof SOCIAL_KEYS)[number], string>> = {};
      for (const key of SOCIAL_KEYS) {
        const value = input[key];
        if (value !== undefined) links[key] = value;
      }
      setSocialLinks(db, links);
      return { ok: true, message: 'Redes sociales actualizadas' };
    },
  }),

  seo: defineAction({
    accept: 'form',
    input: z.object({
      csrf: z.string().optional(),
      seo_site_name: optionalText(),
      seo_default_description: optionalText(),
      seo_default_image: optionalText(),
      seo_keywords: optionalText(),
      seo_robots: optionalText(),
      seo_google_verification: optionalText(),
      seo_analytics_id: optionalText(),
      seo_twitter_handle: optionalText(),
    }),
    handler: async (input, context) => {
      guard(context, input.csrf);
      const db = getDatabase();
      const analytics = input.seo_analytics_id?.trim() ?? '';
      if (analytics && !/^(G|GTM|UA)-[A-Za-z0-9-]+$/.test(analytics)) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'ID de Analytics no válido (usa G-XXXX para GA4 o GTM-XXXX)' });
      }
      const robots = input.seo_robots?.trim() || 'index,follow';
      try {
        setSetting(db, SEO_KEYS.siteName, input.seo_site_name?.trim() ?? '');
        setSetting(db, SEO_KEYS.defaultDescription, input.seo_default_description?.trim() ?? '');
        setSetting(db, SEO_KEYS.defaultImage, input.seo_default_image?.trim() ?? '');
        setSetting(db, SEO_KEYS.keywords, input.seo_keywords?.trim() ?? '');
        setSetting(db, SEO_KEYS.robots, robots);
        setSetting(db, SEO_KEYS.googleVerification, input.seo_google_verification?.trim() ?? '');
        setSetting(db, SEO_KEYS.analyticsId, analytics);
        setSetting(db, SEO_KEYS.twitterHandle, input.seo_twitter_handle?.trim() ?? '');
      } catch (error) {
        return fail(error);
      }
      return { ok: true, message: 'Configuración SEO guardada' };
    },
  }),
};
