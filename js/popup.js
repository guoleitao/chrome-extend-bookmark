$(function () {

    $('#create').click(function () {
        var name = $('#name').val();
        var value = $('#value').val();
        if (name == '' || value == '') {
            alert(chrome.i18n.getMessage("alertMsg"));
        }

        chrome.bookmarks.create({
            'parentId': '1',
            'title': name,
            'url': value
        }, function (result) {
            console.info(JSON.stringify(result));
        });
    });


    $('#combition').text(chrome.i18n.getMessage("combitionBtnText")).click(function () {

        if (confirm(chrome.i18n.getMessage("dialogTitleMsg"))) {
            combitionBookMark();
            alert('success');
            chrome.tabs.executeScript({
                code: 'document.body.click()'
            });
        } else {
            alert(222);
        }
    });

});

var BMap = {};

/**
 * 1.只合并书签栏上所有目录里面的书签，直接放在书签栏上的链接类型不予合并
 * 2.合并后生成新书签名字为"combition_新书签"
 * 3.url相同的两个书签即为重复书签，判断重复与书签名称无关
 * 4.合并完成即所有的标签已经去重，即书签的文件夹名字可能会存在重复，书签名称可能会存在重复，但是书签地址肯定不会重复
 */
function combitionBookMark() {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        if(!bookmarkTreeNodes){
            return;
        }

        initBMap(bookmarkTreeNodes);//标签去重

        chrome.bookmarks.create({
            'parentId': '1',
            'title': chrome.i18n.getMessage("rootNodeTitle"),
            'url': null
        }, function (result) {
            var rootId = result.id;
            if(Array.isArray(bookmarkTreeNodes) && bookmarkTreeNodes.length > 0 && bookmarkTreeNodes[0].id == '0'){
                createBMArray(rootId, bookmarkTreeNodes[0].children);
            }else{
                createBMArray(rootId, bookmarkTreeNodes);
            }


        });
    });
}

//标签去重
function initBMap(bookmarkTreeNodes){
    if(!bookmarkTreeNodes || !Array.isArray(bookmarkTreeNodes)){
        return;
    }
    for (var i = 0; i < bookmarkTreeNodes.length; i++) {
        var nodeTree = bookmarkTreeNodes[i];
        var url = nodeTree.url;
        var id = nodeTree.id;
        if(url){//标签
            var key = createKey(url);
            if (!BMap[key]){
                BMap[key] = 1;
            }else{
                bookmarkTreeNodes[i] = null;
            }
        }else{//文件夹
            initBMap(bookmarkTreeNodes[i].children);
        }
    }
}

function createBMArray(pId, bookmarkTreeNodes) {
    if (!pId || !bookmarkTreeNodes || bookmarkTreeNodes.length == 0) {
        return;
    }

    for (var i = 0; i < bookmarkTreeNodes.length; i++) {
        createBM(pId, bookmarkTreeNodes[i]);
    }

}


function createBM(pId, nodeTree) {
    if (!nodeTree) {
        return;
    }
    var title = nodeTree.title;
    var url = nodeTree.url;

    chrome.bookmarks.create({
        'parentId': pId,
        'title': title,
        'url': url ? url : null
    }, function (result) {
        var id = result.id;
        createBMArray(id, nodeTree.children);
    });
}


function createKey(url) {
    var urlMd5 = hex_md5(url);
    var urlSaltMd5 = hex_md5(url + "combitionBookmark");
    //两次不同md5，降低碰撞几率
    return hex_md5(urlMd5 + urlSaltMd5);
}


document.addEventListener('DOMContentLoaded', function () {
    // document.body.click();
});