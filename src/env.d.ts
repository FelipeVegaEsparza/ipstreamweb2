/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    locale: 'es' | 'en';
    pathWithoutLocale: string;
    originalPathname: string;
  }
}
