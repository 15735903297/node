const request = require('request');

const cheerio = require('cheerio');
const wallpaper = require('wallpaper');
const iconv = require('iconv-lite');
const async = require('async');
const mysql = require('mysql');
const filter = require('bloom-filter-x')
const fs = require('fs');

//1.初始化布隆过滤器
//   -从数据库中读取已有的url；
//   -添加到布隆过滤器中
//2.定时抓取新闻网站上的数据
//  -根据布隆过滤器判定有没有新的新闻
// const connection = mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'',
//     database:'wuif1805'
// });
// //查
// let select_sql = 'select * from news where id=?'
// connection.query(select_sql,[22],(error, results, fields)=>{
//     if (error) throw error;
//     console.log(results);
// });
// //增
// let insert_sql = 'insert into news (title,dsc,content) values (?,?,?)'
// connection.query(insert_sql,[1234,5678,312],(error, results, fields)=>{
//     if (error) throw error;
//     console.log(results.insertId)
// });
// //删
// let delete_sql = 'delete from  news where id=?'
// connection.query(delete_sql,[25],(error, results, fields)=>{
//     if (error) throw error;
//     console.log(results.affectedRows)
// });
// //改
// let update_sql = 'update news set title = ? where id = ?'
// connection.query(update_sql,['abc',28],(error, results, fields)=>{
//     if (error) throw error;
//     console.log(results.affectedRows)
// });
// connection.end();
// for (let i=0;i<3;i++){
//     setTimeout(()=>{
//         console.log('a');
//     },1000)
// }
// async.eachLimit(['1','2','3'],1,(v,next)=>{
//     console.log(v);
// });
// next(null);
// setinteval
// url 去重
function fetch_titles() {
    request({
        url: 'http://news.zol.com.cn/',
        encoding: null
    }, (err, res, body) => {
        body = iconv.decode(body, 'gb2312');
        let $ = cheerio.load(body);
        let titles = [];
        $('.content-list li').each((k, v) => {
            let title = $(v).find('.info-head a').text();
            if (filter.add(title)) {
                titles.push(title);
            }
        });
        let d = new Date();
        if (!titles.length){
            console.log(d.toUTCString()+'捕获一次，本次未更新...')
        }else {
            console.log(d.toUTCString()+'捕获一次,更新'+titles.length+'次')
        }
        async.eachLimit(titles, 1, (v, next) => {
            request({
                title: v,
                encoding:null
            }, (err, res, body) => {
                console.log(v);
                next(null)
            })
        })
    })
}
function fetch_urls() {
    request({
        url: 'http://news.zol.com.cn/',
        encoding: null
    }, (err, res, body) => {
        body = iconv.decode(body, 'gb2312');
        let $ = cheerio.load(body);
        let urls = [];
        $('.content-list li').each((k, v) => {
            let url = $(v).find('.info-head a').attr('href');
            if (filter.add(url)) {
                urls.push(url);
            }
        });
        let d = new Date();
        if (!urls.length){
            console.log(d.toUTCString()+'捕获一次，本次未更新...')
        }else {
            console.log(d.toUTCString()+'捕获一次,更新'+urls.length+'次')
        }
        async.eachLimit(urls, 1, (v, next) => {
            request({
                url: v,
                encoding:null
            }, (err, res, body) => {
                console.log(v);
                next(null)
            })
        });


    })
};
fetch_urls();
fetch_titles();
setInterval(fetch_urls,20000);
setInterval(fetch_titles,20000)
// request({
//     url:'http://news.zol.com.cn/',
//     encoding:null
// },(err,res,body)=>{
//     body = iconv.decode(body,'gb2312')
//     let $ = cheerio.load(body);
//     async.eachLimit($('.content-list li'),1,(v,next)=>{
//         let t = $(v).find('.info-head a');
//         let title = t.text();
//         let dsc = $(v).find('p').contents().eq(0).text();
//         let imagb = $(v).find('img').attr('.src');
//         let url = t.attr('href');
//         console.log(title);
//         request({
//             url:url,
//             encoding:null
//         },(err,res,body)=>{
//             body = iconv.decode(body,'gb2312')
//             let $ = cheerio.load(body);
//             let pubtime = $('#pubtime_baidu').attr('content');
//             let content = $('#article-content').html();
//             // console.log(content);
//             next(null)
//         })
//     })
//     })
//     $('.content-list li').each((k,v)=>{
//         let t = $(v).find('.info-head a');
//         let title = t.text();
//         let dsc = $(v).find('p').contents().eq(0).text();
//         let imagb = $(v).find('img').attr('.src');
//         let url = t.attr('href');
//         console.log(title);
//     request({
//     url:url,
//     encoding:null
// },(err,res,body)=>{
//     body = iconv.decode(body,'gb2312')
//     let $ = cheerio.load(body);
//     let pubtime = $('#pubtime_baidu').attr('content');
//     let content = $('#article-content').html();
//     console.log(content);
// })
// })
// });
// request({
//     url:'https://www.zcool.com.cn/'},
//     (err,res,body)=>{
//     let $ = cheerio.load(body);
//     $('.card-img img').each((k,v)=>{
//         let t = $(v).attr('srcset');
//         if (t){
//             let src = t.split(' ')[0];
//             request(src).pipe(fs.createWriteStream('./zk-'+k+'.jpg'))
//         }
//     })
//
// });
// wallpaper
// request({
//     url:'https://cn.bing.com/'},
//     (err,res,body)=>{
//     let $ = cheerio.load(body);
//         let src = 'https://cn.bing.com' +$('img').last().attr('src');
//         ws = fs.createWriteStream('./bing.jpg');
//         request(src).pipe(ws);
//         ws.on('finish',()=>{
//         wallpaper.set('./bing.jpg').then(()=>{
//             console.log('done')
//         })
//         })
//     })

// request.get(
//     'http://www.baidu.com',
//     (err,res,body)=>{
//         let $ = cheerio.load(body);
//         $('img').each((k,v)=>{
//             let src = $(v).attr('src');
//             if(!src.startsWith('http:')){
//                 src = 'http:'+ src;
//             }
//             console.log(src);
//         })
//     }
// )