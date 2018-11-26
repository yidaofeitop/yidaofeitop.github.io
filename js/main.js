$(document).ready(function() {
	//页面通用需要调整
	//建立搜索
	establishSearch("#search-input");
	//处理列表页面的图片
	 addClassTagParent(".markdown","img","p","article-img"); 
 	//处理分类页面的导航栏
	adjustSiteToc(true);  
 	//盘古之白
 	pangu.spacingPage(); 

 	//判断当前页面是否是单个页面
 	if($("#isPage").attr("data-isPage")=="true"){
 		//处理音乐部分
 		musicStyleBeautify();
 		//处理单页的导航栏
 		adjustSiteToc(false);
 		 
 	} 
 	//回到顶点与定位底部插件
	configScorllTopBottom();
 	/*侧边栏弹出*/
 	bindSidebar("#sidebar-main","#sidebar-main-trigger","sidebar-main","right")
	//处理锚点效果
	adjustAnchorScrollEffect();
	//导航栏响应式
	responsiveNav();
	//分享按钮
	//https://github.com/revir/need-more-share2
	shareButtonOptions = {
		//iconStyle: 'box',   
		position: 'middleLeft',  
		networks: 'Weibo,Wechat,Douban,Evernote,Facebook,GooglePlus,Linkedin,Tumblr'
	};
	new needShareButton('#i-share',shareButtonOptions); 
});

/*
响应式导航栏
链接：
*/
function responsiveNav(){
	$('#site-nav-toggle').on('click', function() { 
	  $(this).toggleClass('open');
	  $('.site-header .menu-left').toggleClass('collapse');
	});

	// REMOVE X & COLLAPSE NAV ON ON CLICK
	$('.menu-left a').on('click', function() { 
	  $('#site-nav-toggle').removeClass('open');
	  $('.site-header .menu-left').removeClass('collapse');
	});
}


/*
处理锚点滑动效果
*/
function adjustAnchorScrollEffect(){
	//处理内容页面的所有页内锚点
	$("section[class='main-content-container']").find("a[href^='#']").on("click",function(event){ anchorSlideSlowly($(this),event); });
	//文章、分类的侧边导航 TOC
	$("div#sidebar-main").find("a[href^='#']").on("click",function(event){ anchorSlideSlowly($(this),event); });
}

/*
配置快速向上或向下按钮 
*/ 
function configScorllTopBottom(){
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
}

/*
绑定弹出侧边栏
插件地址：https://github.com/simple-sidebar/simpler-sidebar
@param targetSelector
@param anchorSelector
@param attrValue
@param alignValue
*/
function bindSidebar(targetSelector,anchorSelector,attrValue,alignValue){
	$(targetSelector).simplerSidebar( {
	  align:alignValue,
	  attr:attrValue ,
	  selectors: {
	    trigger: anchorSelector,
	    quitter: ".quitter"
	  },
	  animation: {
	    easing: "easeOutQuint"
	  }
	}); 
}
/*
调整网站侧面TOC问题
@param isCategoriesPage 是否是分类  默认false
*/
function adjustSiteToc(isCategoriesPage){
	if(isCategoriesPage){
		//处理分类页面的 TOC 锚点错位问题
   		fixTocAnchor("header[class='site-header fixed-top']","section[class='main-content-container']","a[class='categories-title']",true);
	}else{
		//重置文章页面的TOC
		initNavigations("nav#TableOfContents",2,4,"article-toc-item-ul","article-toc-item-li"); 
	    //处理文章页面的 TOC 锚点错位问题 
	    for(var index=1;index<7;index++){
	        if(index==1){
	          fixTocAnchor("header[class='site-header fixed-top']","section[class='main-content-container']","h"+index,true);
	        }
	        fixTocAnchor("header[class='site-header fixed-top']","section[class='main-content-container']","h"+index,false);
	    } 
	} 
}
 
/*
建立搜索

参考文章：
https://www.qikqiak.com/post/hugo-integrated-algolia-search/
algoliasearch 官方API：https://github.com/algolia/autocomplete.js

@param searchInputSelector 输入选择器
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
	    source: $.fn.autocomplete.sources.hits(index, { hitsPerPage: 5 }),
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
music标签美化，利用 aplayer 插件 
链接：https://aplayer.js.org/#/
*/
function musicStyleBeautify(){   
	//使用 Jquery 获取相关的元素 
	var musicSourceTags=$("video[name='media']").children('source');
	
	if(musicSourceTags.length<=0){
		return;
	}
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

