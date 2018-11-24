$(document).ready(function() {
	//回到顶点与定位底部插件
	if($(document).height()>$(window).height()*1.2){ 
      	$.elevator({ 
        	item_top: $('#top-element'),
        	item_bottom: $('#bottom-element'),
	        align: 'bottom right',  
	        navigation: [], 
	        navigation_text: false,
	        speed: 2000,
	        shape: 'circle',
	        glass: false,
	        tooltips: true
      }); 
 	}

 	//调整网站TOC样式
 	adjustSiteToc();
 	//处理图片样式
	dealWithImgStyle();
	//建立搜索
	establishSearch("#search-input");

	//TOC对应问题
	$(window).bind("scroll",function(){
		//加其他参数原因：
	    //https://orianna-zzo.github.io/sci-tech/2018-08/blog%E5%85%BB%E6%88%90%E8%AE%B016-%E8%87%AA%E5%BB%BAhugo%E7%9A%84toc%E6%A8%A1%E6%9D%BF
		var scrollTop = $(this).scrollTop()+1+$("header[class$='site-header']").outerHeight(true);
		tocAnchorSync("a[class='TocAnchor']",scrollTop); 
	});

	/*侧边栏弹出*/
	$("#sidebar-main").simplerSidebar( {
	  align: "right",
	  attr: "sidebar-main",
	  selectors: {
	    trigger: "#sidebar-main-trigger",
	    quitter: ".quitter"
	  },
	  animation: {
	    easing: "easeOutQuint"
	  }
	})
	
	loadMusic();
	//盘古之白 
    pangu.spacingPage();  
 
 
});



/*
调整网站侧面TOC问题
*/
function adjustSiteToc(){
	//重置文章页面的TOC
	initNavigations("nav#TableOfContents",2,4,"article-toc-item-ul","article-toc-item-li"); 
    //处理分类页面的 TOC 锚点错位问题
    fixTocAnchor("nav#TableOfContents","header[class$='site-header']","article[class='main-content']","a[class='categories-title']",true);
    //处理文章页面的 TOC 锚点错位问题

    for(var index=1;index<7;index++){
        if(index==1){
          fixTocAnchor("header[class$='site-header']","article[class^='main-content markdown']","h"+index,true);
        }
        fixTocAnchor("header[class$='site-header']","article[class^='main-content markdown']","h"+index,false);
    } 
}

/*
处理网站部分页面的图片
*/
function dealWithImgStyle(){
  //处理 index.html 的img
  addClassTagParent("article[class^='article-card']","img","p","article-cover");
  //处理 single.html 的img 
  addClassTagParent("article[class^='main-content markdown']","img","p","article-img"); 
}



/*
建立搜索

参考文章：
https://www.qikqiak.com/post/hugo-integrated-algolia-search/
algoliasearch 官方API：https://github.com/algolia/autocomplete.js
*/

function establishSearch(searchInputSelector ){
	//config.toml 传递值到页面，Jquery获取相关的值
	var	AppID=$("#algoliaData").data("appid");
	var	SearchKey=$("#algoliaData").data("searchkey");
	var initindex=$("#algoliaData").data("initindex");
 

	var client = algoliasearch(AppID, SearchKey);
	var index = client.initIndex(initindex);

	
	$(searchInputSelector).autocomplete({ hint: false }, [
	  {
	    source: $.fn.autocomplete.sources.hits(index, { hitsPerPage: 8 }),
	    displayKey: 'name',
	    templates: {
	      suggestion: function(suggestion) { 
	        /*抽取的数据请与index结构对应，最好是通过 chrome 查看suggestion 数据结构*/
	        return '<span>' + '<a href="/' + suggestion.uri.toLowerCase() + '">' +
	            suggestion._highlightResult.title.value + '</a></span>';
	         
	      }
	    }
	  }
	]).on('autocomplete:selected', function(event, suggestion, dataset) {
	    console.log(suggestion, dataset);
	}); 
}


/*
处理music标签：呈现出 aplayer 插件效果
*/
function loadMusic(){   
	//使用 Jquery 获取相关的元素 
	var musicSourceTags=$("video[name='media']").children('source');
	//建立数组
	var musicSourceArray=new Array();
	$.each(musicSourceTags, function(index, musicSourceTag) {
		//获取相关的元素
		var musicURL=$(musicSourceTag).attr("src");
		var musicName=$(musicSourceTag).attr("data-name");
		var musicCover=$(musicSourceTag).attr("data-cover");
		var musicArtist=$(musicSourceTag).attr("data-artist");
		 
		 //插入相关的元素
		var aplayerDiv=$("<div></div>").attr("id","aplayer-"+index);
		$(musicSourceTag).parent("video").before(aplayerDiv) ;
		$(musicSourceTag).parent("video").remove();

		//构建相关的内容，插件为JS插件
		new APlayer({
			container:document.getElementById("aplayer-"+index) ,
			audio: [{
				name:musicName,  
				artist: musicArtist,
				url: musicURL,
				cover: musicCover
				}]
		});  
	});  
}

