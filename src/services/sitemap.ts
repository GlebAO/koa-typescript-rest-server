import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

type UrlItem = {
    loc: string;
    lastMod: string;
    changeFrequency: string;
    priority: number;
}

export default class SitemapService {

    domain: string;
    filename: string;
    path: string;
    urls: UrlItem[];

    constructor(urls: UrlItem[]) {
        this.domain = process.env.DOMAIN || "http://localhost:3000";
        this.filename = 'sitemap.xml';
        this.path = process.env.SITEMAP_SAVE_PATH || '/tmp';
        this.urls = urls;
    }

    protected makeAbsoluteUrl(url: string) {
        return this.domain + url;
    }

    createDocument(content: string) {
        return `<?xml version="1.0" encoding="UTF-8"?>${content}`;
    }

    createUrlSet(urlItems: string) {
        return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    ${urlItems}
                </urlset>`;
    }

    createUrlItem({ loc, lastMod, changeFrequency, priority }: UrlItem) {
        return `<url>
                    <loc>${this.makeAbsoluteUrl(loc)}</loc>
                    <lastmod>${lastMod}</lastmod>
                    <changefreq>${changeFrequency}</changefreq>
                    <priority>${priority.toString()}</priority>
                </url>`;
    }

    

    build() {
        let urlItems = '';
        for (let item of this.urls) {
            urlItems += this.createUrlItem(item);
        }
        const urlSet = this.createUrlSet(urlItems);
        return this.createDocument(urlSet);
    }

    save(xml: string) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path + '/' + this.filename, xml, function (err) {
                if (err) reject(err);
                resolve(true);
            });
        })
    }

}
