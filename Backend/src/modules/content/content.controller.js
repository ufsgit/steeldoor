import { contentService } from './content.service.js';

export class ContentController {
  async getServices(req, res, next) {
    try {
      const data = await contentService.getServices();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getTestimonials(req, res, next) {
    try {
      const data = await contentService.getTestimonials();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getSiteContent(req, res, next) {
    try {
      const data = await contentService.getSiteContent();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export const contentController = new ContentController();
