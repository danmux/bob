(function(){dust.register("pendingjob",body_0);function body_0(chk,ctx){return chk.write("<a href=\"").reference(ctx._get(false, ["url"]),ctx,"h").write("\"><section class=\"row-fluid\" id =\"").reference(ctx._get(false, ["id"]),ctx,"h").write("\"><div class=\"row-fluid\"><div class=\"span10 offset1 job\"><div class=\"row-fluid\"><div class=\"span3\"><h4>Pending...</h4></div><div class=\"span4\"><h4>").reference(ctx._get(false, ["message"]),ctx,"h").write("</h4></div><div class=\"span3\"><h4>").reference(ctx._get(false, ["author"]),ctx,"h").write("</h4></div><div class=\"span2\"><h4>").reference(ctx._get(false, ["id"]),ctx,"h").write("</h4></div></div>\t</div></div></section></a>");}return body_0;})();