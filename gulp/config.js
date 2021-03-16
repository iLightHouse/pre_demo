
module.exports = {
    appName: 'app',
    tempPath: 'temp/',
    libsFiles:{
        sourceLib:'libs/sourceMap/**/*',
        minLib:'libs/min/**/*'
    },
    assetFiles:'src/assets/**/*',
    jsSrcFiles: [
        'src/js/config/*.js',
        'src/js/run.js',
        'src/js/service/*.js',
        'src/js/**/*.js',
        'src/pages/**/*.js'
    ],
    wwwFiles: {
        img: {
            src: 'src/img/**/*',
            outPut:'www/img/'
        },
        pages:{
            src:'src/pages/**/*.html',
            outPut:'www/pages/'
        },
        txts:{
            src:'src/pages/**/*.json',
            outPut:'www/pages/'
        },
        index:{
            src:'src/index.html',
            dev_src:'src/index_dev.html',
            outPut:'www/'
        },
        other:{
            src:['src/config.json','src/main.html'],
            outPut:'www/'
        }
    },
    jsFiles: [
        'src/**/*.js',
        '!src/**/*.spec.js'
    ],
    scssSrcFiles: [
        'src/css/_mixins.scss',
        'src/css/_variables.scss',
        'src/css/*.scss',
        'src/pages/**/*.scss'
    ],
    outputDir: 'www/',
    corodva:{
        wwwRoot:'cordova/www/',
        zipPassword:'Tf123Qwe',
        sourceZip:'cordova/www.zip',
        /*toTargetPath:'D:/www/'*/
        toTargetPath:'F:/AOMEN/YDZYDBK/android/app/src/main/assets/www'
    },
    script:{
        zipJar:'script/EMDP_WWW_ZIP.jar'
    }
};
