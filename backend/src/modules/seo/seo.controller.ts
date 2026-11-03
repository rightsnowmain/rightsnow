import { Controller, Get, Header } from '@nestjs/common';
import { SeoService } from './seo.service';

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSitemap() {
    return this.seoService.generateSitemapXml();
  }

  @Get('api/v1/sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getApiSitemap() {
    return this.seoService.generateSitemapXml();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'public, max-age=86400')
  getRobots() {
    return this.seoService.generateRobotsTxt();
  }
}

