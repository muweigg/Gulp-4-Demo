module.exports = {
    module: {
        rules: [
            { test: /\.(t|j)s$/, use: ['ts-loader'] },
            { test: /\.css$/, use: ['style-loader', 'css-loader?url=false&minimize=true', 'sass-loader'] },
            { test: /\.s(a|c)ss$/, use: ['style-loader', 'css-loader?url=false&minimize=true', 'sass-loader'] },
        ]
    }
}