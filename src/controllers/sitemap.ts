import Koa from 'koa';
import { UserRole } from '../models';
import HttpStatus from 'http-status-codes';
import SitemapService from "../services/sitemap";
import { getAllActivePosts } from '../repository/PostsRepository';
import { getFormattedDate } from '../uitls';
import { TagsRepository } from '../repository/TagsRepository';
import { getCustomRepository } from 'typeorm';

export const create = async (ctx: Koa.Context): Promise<void> => {
    if (ctx.user.role !== UserRole.ADMIN) {
        ctx.throw(HttpStatus.FORBIDDEN, "Недостаточно прав");
    }

    let urls = [{
        loc: '/', lastMod: getFormattedDate(new Date(), '-'), changeFrequency: 'weekly', priority: 1
    }]

    const posts = await getAllActivePosts();
    console.log(posts);
    if( posts ) {
        let postUrls = posts.map(post => ({
            loc: `/post/${post.slug}`, lastMod:  getFormattedDate(post.updatedAt, '-'), changeFrequency: 'monthly', priority: 0.8
        }));
        urls.push(...postUrls);
    }

    const tagsRepository = getCustomRepository(TagsRepository);
    const tags = await tagsRepository.getAllTags();
    if(tags) {
        let tagUrls = tags.map(tag => ({
            loc: `/t/${tag.slug}`, lastMod: getFormattedDate(new Date(), '-'), changeFrequency: 'monthly', priority: 0.7
        }));
        urls.push(...tagUrls);
    }

    const sitemapService = new SitemapService(urls);
    const xml = sitemapService.build();
    const result = await sitemapService.save(xml);

    if(result instanceof Error) {
        ctx.throw(HttpStatus.BAD_REQUEST, `${result.name}: ${result.message}`);
    }

    ctx.response.status = 200;
}