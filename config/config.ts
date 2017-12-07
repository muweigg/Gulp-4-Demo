export const exts = '{jpg,jpeg,gif,png,svg,ttf,eot,woff,woff2}';

export const dist = './dist';

export const paths = {
    src: {
        js: [
            'src/js/**/*.ts',
            '!src/js/common/**/*',
            '!**/*.d.ts',
        ],
        scss: [
            'src/scss/**/*.scss',
            '!src/scss/common/**/*',
        ],
        assets: [`src/assets/**/*.${exts}`],
        sprites: [`src/sprites/icons/**/*.png`],
        template: [
            'src/templates/**/*.html',
            '!src/templates/common/**/*.html',
        ],
        common: {
            js: ['src/js/common/vendors.ts'],
            css: ['src/scss/common/common.scss'],
        },
    },
    watch: {
        js: ['src/js/**/*.ts'],
        scss: [
            'src/scss/**/*.scss',
            '!src/scss/common/**/*',
        ],
        assets: [`src/assets/**/*.${exts}`],
        sprites: [`src/sprites/icons/**/*.png`],
        template: ['src/templates/**/*.html'],
        common: {
            js: ['src/js/common/**/*.{ts,js}'],
            css: [
                'src/scss/common/**/*',
                '!src/scss/common/_',
            ],
            _: ['src/scss/common/_/**/*'],
        }
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
}