import 'script-loader!babel-loader!./third-party/rxjs.umd';
import 'script-loader!babel-loader!lodash/lodash';
import 'script-loader!babel-loader!vue/dist/vue.min';
import 'script-loader!babel-loader!axios/dist/axios';
import 'script-loader!babel-loader!jquery/dist/jquery.slim';

window.isIE = () => {
    let match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
    return match ? parseInt(match[1]) : undefined;
}