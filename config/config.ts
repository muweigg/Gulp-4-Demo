export const exts = '{jpg,jpeg,gif,png,svg,ttf,eot,woff,woff2}';

export const dist = './dist';

export const paths = {
    src: {
        js: ['src/js/**/*.ts'],
        scss: ['src/scss/**/*.scss'],
        assets: [`src/assets/**/*.${exts}`],
        sprites: [`src/sprites/icons/**/*.png`],
        template: ['src/templates/**/*.html'],
    },
    common: {
        js: [
            'src/js/common/vendors.ts',
        ],
        css: [
            'src/scss/common/common.scss',
        ],
    },
    filter: {
        js: ['**', '!src/js/common/**/*', '!**/*.d.ts'],
        css: ['**', '!src/css/common/**/*.css'],
        scss: ['**', '!src/scss/common/**/*.scss'],
        template: ['**', '!src/templates/common/**/*.html'],
    },
    output: {
        root: `${dist}`,
        rev: `${dist}/rev`,
        js: `${dist}/js`,
        css: `${dist}/css`,
        assets: `${dist}/assets`,
        sprites: {
            scss: 'src/scss/common/_',
            images: 'src/assets/images',
        }
    },
    process: [`${dist}/rev/**/*.json`, `${dist}/**/*.css`, `${dist}/**/*.html`],
    rebaseTo: 'src/dist/'
};