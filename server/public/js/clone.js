(function(){dust.register("clone",body_0);function body_0(chk,ctx){return chk.write("<div class=\"row-fluid\"><div class=\"span10 offset1\"><div class=\"row-fluid\"><div class=\"span6\"><div class=\"hero-unit\"><h2>Create fresh build from master.</h2><div class=\"row-fluid pagination-centered\"><button class=\"btn\" id=\"webnewmaster\">Go!</button></div></div></div><div class=\"span6\"><div class=\"hero-unit\"><h2>Create release candidate tagged build</h2><div class=\"row-fluid pagination-centered\"><div class=\"btn-group\"><a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" >Choose Tag<span class=\"caret\"></span></a><ul class=\"dropdown-menu webtaglist\">").exists(ctx._get(false, ["web_tags"]),ctx,{"else":body_1,"block":body_2},null).write("</ul></div></div></div></div></div><!-- div class=\"row-fluid\"><div class=\"span6\"><div class=\"hero-unit\"><h2>Create fresh build of pageserver.</h2><div class=\"row-fluid pagination-centered\"><button class=\"btn\" id=\"newpageserver\">Go!</button><div class=\"btn-group\"><a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" >Deploy Pageserver to:<span class=\"caret\"></span></a><ul class=\"dropdown-menu deploylist\"><li id=\"live\"><a tabindex=\"-1\">live</a></li><li id=\"stage\"><a tabindex=\"-1\">stage</a></li></ul></div></div></div></div><div class=\"span6\"><div class=\"hero-unit\"><h2>Create release candidate tagged build</h2><div class=\"row-fluid pagination-centered\"><div class=\"btn-group\"><a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" >Choose Tag<span class=\"caret\"></span></a><ul class=\"dropdown-menu pstaglist\">").exists(ctx._get(false, ["ps_tags"]),ctx,{"else":body_4,"block":body_5},null).write("</ul></div></div></div></div></div--></div></div>");}function body_1(chk,ctx){return chk.write("<li>Go to '/' and refresh</li>");}function body_2(chk,ctx){return chk.section(ctx._get(false, ["web_tags"]),ctx,{"block":body_3},null);}function body_3(chk,ctx){return chk.write("\t\t\t\t\t   \t <li id=\"").reference(ctx._get(false, ["tag"]),ctx,"h").write("\"><a tabindex=\"-1\">").reference(ctx._get(false, ["tag"]),ctx,"h").write("</a></li>");}function body_4(chk,ctx){return chk.write("<li>Go to '/' and refresh</li>");}function body_5(chk,ctx){return chk.section(ctx._get(false, ["ps_tags"]),ctx,{"block":body_6},null);}function body_6(chk,ctx){return chk.write("\t\t\t\t\t   \t <li id=\"").reference(ctx._get(false, ["tag"]),ctx,"h").write("\"><a tabindex=\"-1\">").reference(ctx._get(false, ["tag"]),ctx,"h").write("</a></li>");}return body_0;})();