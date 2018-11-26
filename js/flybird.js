/*
TOC 导航与页面锚点同步显示
@param anchorSelector 锚点选择器
@param scrollTop 滚动栏与顶部高度
*/
function tocAnchorSync(navSelector,anchorSelector,scrollTop){
  var topAnchor=null; 

  var pageAnchorAarray=$(anchorSelector);

  //判断当前位置的上一个 Anchor
  $.each(pageAnchorAarray, function(index, anchor) {
      //先判处小于情况
      if(anchor.offsetTop<scrollTop){
        topAnchor=anchor;
      }
      else if(anchor.offsetTop>=scrollTop&&topAnchor!=null){
         return false;
      }  
  }); 

   //定位相关的定位
  if(topAnchor!=null){
   
    var anchorID=$(topAnchor).attr("id");
    var selectorStr="a[href='#"+anchorID+"']";

    $(navSelector).find("a").removeClass("toc-item-scrollSync");
    $(navSelector).find(selectorStr).toggleClass("toc-item-scrollSync");
  } 
 
}

/**
修复由于 导航栏 固定引发的侧边栏定位不准问题
原文链接：https://www.jianshu.com/p/3a4c40d31e5b


@param siteNavSelector：必需 固定导航栏选择器 
@param mainContentSelector：必需 主体内容选择器
@param anchorSelector:必需  锚点选择器
@param dealMainContentMT:非必需 是否处理主体容器偏差
**/
function fixTocAnchor(siteNavSelector,mainContentSelector,anchorSelector,dealMainContentMT){
  //获取固定浮动头部的高度
  var headerHeight=$(siteNavSelector).outerHeight(true);
  //处理主体内容偏差
  if(dealMainContentMT){ 
    var mainContentMT=$(mainContentSelector).css("margin-top");
    $(mainContentSelector).css(mainContentMT+headerHeight);
  }

  //处理锚点，在锚点之前插入一个隐形的锚点，并将锚点的ID去掉结束锚点属性
  var styleStr="display: block;  position: relative;  top:-"+headerHeight+"px;" 
  var anchorTag=null; 

  var anchorArray=$(anchorSelector);
  $.each(anchorArray, function(index, anchor) {
       if($(anchor).attr("id")!=null && $(anchor).attr("id").length>0 ){
          anchorTag=$("<a></a>").attr("id",$(anchor).attr("id")).attr("style",styleStr).addClass("TocAnchor");
          
          $(anchor).before(anchorTag);
          $(anchor).attr("id","");
       }
   });  
}



/**
针对某个范围的某个标签的父亲标签添加某个样式
如下文针对P设定相关样式

<div class="main-content">
  <p>
    <img></img>
  </p>
</div>

@param topSelector：最顶层选择器
@param aimTag：必需 目标标签
@param parentTag:必需 目标标签父标签 
@param addParentClass：必需 绑定 CSS
**/
function addClassTagParent(topSelector,aimTag,parentTag,addParentClass){
  //处理顶层元素
  var topTagArr=$(topSelector); 
  if(topTagArr==null || topTagArr.length<1){
    return -1;
  }

  //处理目标元素
  var aimTagArr=$(topTagArr).find(aimTag); 
  if(aimTagArr==null || aimTagArr.length<1){
    return 0;
  }
  //处理父辈元素
  aimTagArr.parent(parentTag).addClass(addParentClass);  
}



/*
重定义TOC 
参考文章：https://linuxer.io/posts/hugo-toc/
*/
/*
重置TOC样式
@param navSelector TOC导航栏选择器
@param maxLevel  最大层次
@param ulTagClass <ul> 标签样式
@param liTagClass <li> 标签样式
*/
function initNavigations(navSelector,startLevel,endLevel,ulTagClass,liTagClass){
    //重新定义TOC    
   
    var navigations=$(navSelector); 
    var replaceHTML=extraStartTocDom(navSelector,startLevel)
    //判断是否有标题内容
    if(replaceHTML.length=0){
        replaceHTML="<center>该文章无目录《/center>";
    }else{
        replaceHTML="<center>目录</center><br/>"+replaceHTML;
    }
    $(navigations).html(replaceHTML); 
    //增加SN序号()
    addSNTocNav(navSelector,startLevel,endLevel)
    //增加样式
    $(navigations).find('ul').addClass(ulTagClass); 
    $(navigations).find('li').addClass(liTagClass); 
}


/*
抽取开始层次的DOM
@param navSelector 导航栏选择器
@param startLevel 开始层次
*/
function extraStartTocDom(navSelector,startLevel){
  var extraStack=new Array(); 
  extraStack.push($(navSelector).children("ul"));

 
  for (var currentLevel = 0; currentLevel <startLevel-1; currentLevel++) {
    var statckLength=extraStack.length;
    for (var index = 0; index < statckLength; index++) {
      var ulTag=extraStack.shift();
      $.each($(ulTag).children("li").children('ul'), function(index, val) {
         extraStack.push($(val));
      });
    }
  } 
  
  var replaceHTML=null;
  //组合成对应的HTML
  var statckLength=extraStack.length;

  replaceHTML="<ul>"
  for (var index = 0; index < statckLength; index++) {
     replaceHTML=replaceHTML+$(extraStack.shift()).html(); 
  }
  replaceHTML=replaceHTML+"<ul>"
   
  return replaceHTML;
}

/*
抽取开始层次的DOM
@param navSelector 导航栏选择器
@param startLevel 开始层次
@param endLevel 结束层次
*/
function addSNTocNav(navSelector,startLevel,endLevel){ 
  var tocNavStack=new Array();
  tocNavStack.push($(navSelector).children("ul"));

  var currentLevel=startLevel;

  while(tocNavStack.length>0){
    //处理相关元素
    var tocNavItem=tocNavStack.shift();
    var brotherValue=$(tocNavItem).children("li").children("a").length>0?true:false;
    //处理特殊情况  
      /**
      <ul>
         <li><ul></ul><ul></ul></li>
         <li><ul></ul><ul></ul></li>
      </ul>
      **/

    $.each($(tocNavItem).children("li"), function(index, liTag) {
      var parentTagSN=$(tocNavItem).attr("data-sn");
      var parentLevel=$(tocNavItem).attr("data-level");
      var currentTagSN=parentTagSN+"."+String(index+1);
      var currentLevel=parseInt(parentLevel)+1;

      if(parentTagSN=="" || parentTagSN==null||parentTagSN==undefined){
        currentTagSN=String(index+1);
        currentLevel=startLevel;
      }
      
      //加入序号
      var anchorTag=$(liTag).children("a");
      $(anchorTag).text(currentTagSN+" "+$(anchorTag).text()); 
      //判断是否有子元素，如有设置相关的属性
      var childULTag=$(liTag).children("ul");
      if(childULTag.length>0&&(currentLevel<=endLevel)){ 
        
        if(brotherValue){
           $(childULTag).attr("data-sn",currentTagSN);
           $(childULTag).attr("data-level",currentLevel);
        }
        //推入栈中处理  
        tocNavStack.push($(childULTag));
      }
      if(currentLevel>=endLevel&&childULTag.length>0){
        childULTag.remove();
      }
    });  
  } 
}



/*
锚点滑动，并解决乱码问题
@param event 事件
*/
function anchorSlideSlowly($anchor,event){
  //滑动相关配置
  var settings = {navOffset : 55,scrollTime : 1000};  
  //解决中文乱码问题
  var target = decodeURIComponent(decodeURIComponent($anchor.attr("href"))); 
  //解除其他插件利用ID跳转的问题
  if($(target).length>0){
    var targetPosition = $(target).offset().top; 
    event.preventDefault(); 
    //滑动
    $("html, body").stop().animate({scrollTop:targetPosition - settings.navOffset}, settings.scrollTime);
  } 
};