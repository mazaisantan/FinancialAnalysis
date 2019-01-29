bfd.dataBrowse = {
	fullurl: '',
	paramUrl: '',
	paramcount: 0,
	activeFlag: true,
	id:'',
	init: function() {
		//根据id跳转
		var str = location.href.split('?')[1];
		if(str) {
			var strArr = str.split('&');
			var arr = [];
			for(var i = 0; i < strArr.length; i++) {
				arr = strArr[i].split('=');
				if(arr[0] == 'id') {
					this.id = arr[1];
				}
			}
		}
		this.datePicker();
		//	this.witchTabs(); //左侧 tab页切换
		this.getTreeData(); //获取左侧 tree数据
		this.treeNodeClick(); //点击左侧 tree 获取api详情
		this.searchTree(); //关键字搜索左侧 tree api
		this.getRightTreeData(); //获取右侧 classify-tree数据
		this.rightTreeNodeClick(); //点击右侧 classify-tree 获取api详情
		this.searchRightTree(); //关键字搜索右侧 classify-tree api
		this.codesSearchLeft(); //右侧上部unselectbox复选框 代码搜索
		this.reYear(); //可输入选择框
		this.getCondotionVal(); // 预览数据
		this.keysSearchLeft(); //右侧下部 unselectbox复选框 字段搜索
	},
	/*//左边tab页切换
	witchTabs: function(){
		var _this = this;
		$('.indexNavigationA').click(function(){
			$('.indexNavigationA').parent('li').addClass('active');
			$('#indexNavigation').show();
			$('.detail-cont').show();
			
			$('.myProgrammeA').parent('li').removeClass('active');
			$('#myProgramme').hide();
			
			_this.getTreeData();
		});
		
		$('.myProgrammeA').click(function(){
			$('.myProgrammeA').parent('li').addClass('active');	
			$('#myProgramme').show();
			$('.detail-cont').hide();
			$('#apiName').text('我的方案部分详情---敬请期待');
			
			$('.indexNavigationA').parent('li').removeClass('active');
			$('#indexNavigation').hide();
		});
	},*/
	/**
	 * 左边tree
	 */
	getTreeData: function(name){
	  var _this = this;
	  $.ajax({
	    url: env.baseUrl + 'apidoc/apiDocTree',
	    type: 'post',
	    data: {
	      name: name,
	      type: 2
	    },
	    complete: function(XMLHttpRequest, status){
	      if(status == 'error') return;
	      _this.activeFlag = true;
	      var dataBrowseJson = XMLHttpRequest.responseJSON || JSON.parse(XMLHttpRequest.responseText)
	      if(dataBrowseJson.code !== '000000') return;
		  
		  var liObj;
		  for(var i = 0; i < dataBrowseJson.data[0].children.length; i++){
			if(dataBrowseJson.data[0].children[i].name === 'SYSAPI03'){
				liObj = dataBrowseJson.data[0].children[i];
			}
		  }
	      
		  var liArray = [liObj];
	      var li = _this.apiTree(liArray);
	
	      $(".databrowse-tree .tree").html(li);
	      $(".databrowse-tree .tree").treemenu({delay:300}).openActive();
	    }
	  });
	},
	apiTree: function(treeData){
		var _this = this;
		var liArr = treeData.map(function(v, i){
			var li = $('<li></li>');
			if(v.children || v.apiList){ //表示有子节点
				var span = $('<span><i></i>' + (v.alias || v.name) + '</span>');
				var ul = $('<ul></ul>');
				var childLi = _this.apiTree(v.children || v.apiList);

				ul.append(childLi);
				li.append(span);
				li.append(ul);
			}else{ //没有子节点
				var a = $('<a data-name="' + (v.alias || v.name).toLowerCase() + '" data-id="' + v.id + '" data-apiname="' + v.name + '">' + (v.alias || v.name) + '</a>');
				if(_this.activeFlag && (!_this.id || _this.id == v.id)){
					a.addClass('active');
					_this.apiDetail(v.id);
					_this.activeFlag = false;
				}
				li.append(a);
			}
			return li;
		});
		return liArr;
	},
	treeNodeClick: function(){
		var _this = this;
		$(".dataBrowse .databrowse-tree .tree").off();
		$(".dataBrowse .databrowse-tree .tree").on('click', 'a', function(){
			$(".dataBrowse .databrowse-tree .tree a").removeClass('active');
			$(this).addClass('active');
			
			var id = $(this).attr('data-id');
			_this.apiDetail(id);
		});
	},
	apiDetail: function(id){
		//点击切换api时，清空之前的结果
		$('.condition2 select').html('');
		$(".detail-cont-bottom .selected-ul").html('');
		$('.detail-cont-table').css('display', 'none');
		$('.detail-cont-table .span_unit #i_unit').html('');
		
		var _this = this;
		_this.paramUrl = ''; //在切换api时，先清空之前的条件
		_this.paramcount = 0;
		$.ajax({
			url: env.baseUrl+'apiinfo/info?id='+ id,
			complete: function(XMLHttpRequest, status){
				if(status == 'error') return;
				var dataBrowseApiInfoJson = XMLHttpRequest.responseJSON || JSON.parse(XMLHttpRequest.responseText);
				if(dataBrowseApiInfoJson.code !== '000000') return;

				var data = dataBrowseApiInfoJson.data;
				$('#apiName').text(data.alias);
				
				var apiname = data.name;
				var tablename = data.alias;
				_this.getCondition(apiname, tablename);
				/****api4url替换****/
				///_this.fullurl = data.fullUrl.replace("api1","api4");
				_this.fullurl = data.fullUrl;
				var li = _this.bottomUnselectLis(data);
				$(".detail-cont-bottom .unselect-ul").html(li);				
			}
		});
	},
	searchTree: function(){
		var _this = this;
		$('.dataBrowse .cont-left .api-search-left i').click(function(){
			var val = ($(this).prev().val()).toLowerCase();
			$('.cont-left .databrowse-tree .tree>li>ul').css('height', '100%').css('visibility', 'visible');
			if(val){
				_this.findApi(val);
			}else{
				_this.getTreeData();
			}
		});
	},
	findApi: function(val){
		var result_a = $('.databrowse-tree').find('a[data-name*=' + val + ']');
		if(!result_a.length){ //如果没有搜索到数据
			$('.databrowse-tree .tree>li>ul').css('height', '0px').css('visibility', 'hidden');
			return;
		}
		
		$('.databrowse-tree').find('li').removeAttr('id').show();
		result_a.show();
		result_a.parents('li').attr('id', 'result_a');
		result_a.parents('li').parent().find('>li:not([id=result_a])').hide();
		result_a.parents('li').removeClass('tree-closed').addClass('tree-opened');
		result_a.parents('li').find('>ul').css('display', 'block');
	},
	/**
	 * 右边classify-tree
	 */
	getRightTreeData: function(){
		var _this = this;
		var url = env.baseUrl.replace('api-cloud-platform', 'api') + 'sysapi/p_sysapi1016';
		$.ajax({
			url: url,
			type: 'post',
			success: function(_data){
				if(_data.resultmsg === 'success'){
					var li = _this.rightApiTree(_data.records);
					$(".detail-cont-tree .classify-tree").html(li);
					$(".detail-cont-tree .classify-tree").treemenu({
						delay: 300
					}).openActive();
				}
			}
		});
	},
	rightApiTree: function(classifyTreeData){
		var _this = this;
		var liArr = classifyTreeData.map(function(v, i){
			var li = $('<li></li>');
			if(v.children){
				var span = $('<span data-name="' + v.SORTNAME + '" data-id="' + v.SORTCODE + '" data-param="' + v.PARAM + '" data-api="' + v.API + '"><i></i>' + v.SORTNAME + '</span>');
				var ul = $('<ul></ul>');
				var childLi = _this.rightApiTree(v.children);
				ul.append(childLi);
				li.append(span);
				li.append(ul);
			}else{
				var a = $('<a data-name="' + v.SORTNAME + '" data-id="' + v.SORTCODE + '" data-param="' + v.PARAM + '" data-api="' + v.API + '">' + v.SORTNAME + '</a>');
				li.append(a);
			}
			return li;
		});
		return liArr;
	},
	rightTreeNodeClick: function(){
		var _this = this;
		$('.cont-right .detail-cont-tree .classify-tree').off();
		$('.cont-right .detail-cont-tree .classify-tree').on('click', 'a', function(){
			$('.cont-right .detail-cont-tree .classify-tree a').removeClass('active');
			$(this).addClass('active');

			var param = $(this).attr('data-param');
			var dapi = $(this).attr('data-api');
			_this.rightApiDetail(param, dapi);
		});
		$('.cont-right .detail-cont-tree .classify-tree').on('click', 'span', function(){
			$('.cont-right .detail-cont-tree .classify-tree span').removeClass('active');
			$(this).addClass('active');

			var param = $(this).attr('data-param');
			var dapi = $(this).attr('data-api');
			_this.rightApiDetail(param, dapi);
		});
	},
	rightApiDetail: function(param, dapi){
		$('.detail-cont-top .cont-top-right .unselect-ul').html('');
		
		if(dapi !== 'null'){
			var _this = this;
			var url = window.location.origin + dapi + '?' + param +  '&@column=SECCODE,SECNAME';
			$.ajax({  
				url: url,
				type: 'post',
				success: function(_data) {
					if(_data.resultmsg === 'success') {
						var data = _data.records;
						var li = _this.unselectLis(data);
						$('.detail-cont-top .cont-top-right .unselect-ul').html(li);
					}
				}
			});
		}
	},
	searchRightTree: function() {
		var _this = this;
		$('.cont-right .classify-search i').click(function() {
			var val = ($(this).prev().val()).toLowerCase();
			$('.detail-cont-tree .classify-tree>li>ul').css('height', '100%').css('visibility', 'visible');

			if(val) {
				_this.findRightApi(val);
			} else {
				_this.getRightTreeData();
			}
		});
	},
	findRightApi: function(val) {
		var result_a = $('.detail-cont-tree').find('a[data-name*=' + val + ']');
		if(!result_a.length) { //搜索框没有输入
			$('.detail-cont-tree .classify-tree>li>ul').css('height', '0px').css('visibility', 'hidden');
			return;
		}
		$('.detail-cont-tree').find('li').removeAttr('id').show();
		result_a.show();
		result_a.parents('li').attr('id', 'result_a');
		result_a.parents('li').parent().find('>li:not([id=result_a])').hide();
		result_a.parents('li').removeClass('tree-closed').addClass('tree-opened');
		result_a.parents('li').find('>ul').css('display', 'block');
	},
	unselectLis: function(unselectData) {
		var _this = this;
		var liArr = unselectData.map(function(v, i) {
			var li = $('<li></li>');
			var lable = $('<label class="my_protocol"></label>');
			var inputs = $('<input type="checkbox" class="checkboxs" />');
			var i = $('<i></i>');
			var span = $('<span data-name="' + v.SECNAME + '" data-id="' + v.SECCODE + '" data-value="' + (v.SECCODE + '-' + v.SECNAME) + '">' + (v.SECCODE + '-' + v.SECNAME) + '</span>');
			lable.append(inputs);
			lable.append(i);
			lable.append(span);
			li.append(lable);
			return li;
		});

		var liArrLength = liArr.length;
		_this.leftRight(liArrLength);

		return liArr;
	},
	//左右移动复选框
	leftRight: function(liArrLength) {
		var unselectcount = $(".detail-cont-top .cont-top-right #unselectcount");
		var selectedcount = $(".detail-cont-top .cont-top-right #selectedcount");
		
		//实时动态显示可选择字段和已选择字段的数量
		unselectcount.eq(0).text(liArrLength);
		selectedcount.eq(0).text($('.detail-cont-top .cont-top-right .selected-ul li').length);
		
		//全选函数
		$('.detail-cont-top .cont-top-right .checkbox-all').click(function() {
			if($(this).prop('checked')) {
				$(this).parent().parent().nextAll().find('.checkboxs').prop('checked', true);
			} else {
				$(this).parent().parent().nextAll().find('.checkboxs').prop('checked', false);
			}
		});
		
		//单个checkbox与全选的关系函数
		$('.cont-top-right .select-content').off().on('click', 'span', function(e) {
			var checkedAll = $(this).parents('.select-content').prevAll().find('.checkbox-all');
			var checkboxs = $(this).parent().find('checkboxs').prop('checked');
			if(!checkboxs && checkedAll.prop('checked')) { //有单个没选中，且全选框选中，取消全选框选中状态
				checkedAll.prop('checked', false);
			} else if(checkboxs && !checkedAll.prop('checked')) { //单个都选中，且全选框未选中
				var lis = $(this).parent().parent();
				for(var i = 0; i < lis.length; i++) {
					if($(lis[i]).find('.checkboxs').prop('checked')) {
						if(i == lis.length - 1) { //单个选中的数量 == 所有li的数量 时，表示li被全部选中
							checkedAll.prop('checked', true)
						}
					} else {
						break;
					}
				}
			}
		});
		
		//左右移按钮点击事件
		$('.detail-cont-top .cont-top-right .arrow-btn').off().on('click', function(){
			var checkboxs, origin, target;
			var num = 0;
			if($(this).hasClass('right')) {
				origin = $('.detail-cont-top .cont-top-right .unselect-ul');
				target = $('.detail-cont-top .cont-top-right .selected-ul');
			} else {
				origin = $('.detail-cont-top .cont-top-right .selected-ul');
				target = $('.detail-cont-top .cont-top-right .unselect-ul');
			}
			
			checkboxs = origin.find('.checkboxs');
			for(var i = 0; i < checkboxs.length; i++) {
				if($(checkboxs[i]).prop('checked')) {
					var that = $(checkboxs[i]).parent().parent().clone();
					target.append(that);
					that.children().children('input').prop('checked', false);
					$(checkboxs[i]).parent().parent().remove();
				} else {
					num++;
				}
			}
			
			//代码选择去重
			var origin_span = origin.find('span');
			var target_span = target.find('span');
			var origin_code = [];
			var target_code = [];
			for(var i = 0; i < origin_span.length; i++){
				origin_code.push($(origin_span[i]).attr('data-id'));
			}
			for(var i = 0; i < origin_code.length; i++){
				if(origin_code.indexOf(origin_code[i]) != i){
					$(origin_span[i]).parent().parent().remove();
				}
			}
			for(var i = 0; i < target_span.length; i++){
				target_code.push($(target_span[i]).attr('data-id'));
			}
			for(var i = 0; i < target_code.length; i++){
				if(target_code.indexOf(target_code[i]) != i){
					$(target_span[i]).parent().parent().remove();
				}
			}
			
			//在一侧点击全选移动之后，该侧的全选按钮应该取消选中
			$(".detail-cont-top .cont-top-right .checkbox-all").prop("checked", false);
			//实时动态显示可选择字段和已选择字段的数量
			unselectcount.eq(0).text($('.detail-cont-top .cont-top-right .unselect-ul li').length);
			selectedcount.eq(0).text($('.detail-cont-top .cont-top-right .selected-ul li').length);
			
			if(checkboxs.length == num) {
				alert('请至少选择一个代码操作');
			} else {
				origin.parent().prev().find('.checkbox-all').prop('checked', false);
			}
		});
	},
	codesSearchLeft: function(){
		var _this = this;
		$('.detail-cont-top .cont-top-right .codes-search-left i').click(function(){
			var val = ($(this).prev().val());
			$('.detail-cont-top .cont-top-right .unselect-ul').css('height', '100%').css('visibility', 'visible');
			
			if(val){
				_this.findCodesLeft(val);
			}else{
				$('.detail-cont-top .cont-top-right .unselect-ul').find('li').show();
			}
		});
	},
	findCodesLeft: function(val){
		var result_span = $('.detail-cont-top .cont-top-right .unselect-ul').find('span[data-value*=' + val + ']');
		if(!result_span.length) {
			$('.detail-cont-top .cont-top-right .unselect-ul').css('height', '0px').css('visibility', 'hidden');
			return;
		}
		$('.detail-cont-top .cont-top-right .unselect-ul').find('li').removeAttr('id').show();
		result_span.show();
		result_span.parents('li').attr('id', 'result_span')
		result_span.parents('li').parent().find('>li:not([id=result_span])').hide();
	},
	//日期插件
	datePicker: function(){
		//默认时间为近30天
		var dataNum = new Date().getTime()-1000*60*60*24*30
		var defaultDateStart = new Date(dataNum).Format("yyyy-MM-dd");
		var defaultDateEnd = new Date().Format("yyyy-MM-dd");
		$('.dataBrowse #dBDatepair .start').val(defaultDateStart);
		$('.dataBrowse #dBDatepair .end').val(defaultDateEnd);
	    $('.dataBrowse #dBDatepair .date').datepicker({
	      'format': 'yyyy-mm-dd',
	      'autoclose': true,
	      'clearBtn': true
	    });
	},
	reYear: function(){
		$('#se1, #se2').editableSelect({
		    effects: 'fade',   //下拉列表出来的方式
		    duration: 200,  //时间
		}); 
	},
	getCondition: function(apiname, tablename){
		$('.detail-cont-table .span_target .span_lt').html(tablename);
		
		var _this = this;
		var url = env.baseUrl.replace('api-cloud-platform', 'api') + 'sysapi/p_sysapi1017?apiname=' + apiname;
		$.ajax({
			type: 'post',
			url: url,
			success: function(_data){
				if(_data.resultmsg === 'success'){
					if(_data.records.length != 0){
						$('.cont-right .detail-cont-center').css('display', 'block');
						//报告年份，报告类型
						if(_data.records[0].paraminfo.repyear && _data.records[0].paraminfo.reptype){
							$('.detail-cont-center .condition1').css('display', 'inline-block');
							$('.condition1 label').html(_data.records[0].paraminfo.repyear.paramname);
							$('.detail-cont-center .condition2').css('display', 'inline-block');
							$('.condition2 label').html(_data.records[0].paraminfo.reptype.paramname);
							$('.condition1 #se1_sele').attr('placeholder', '请输入或选择年份');
							
							var defTime = _data.records[0].paraminfo.repyear.paramvalue;
							var se1_lis = $('#se1_editable-select-options ul li');
							for(var i = 0; i < defTime.length; i++){
								for(var j = 0; j < se1_lis.length; j++){
									$(se1_lis[0]).html(defTime[0]);
									$(se1_lis[1]).html(defTime[1]);
									$(se1_lis[2]).html(defTime[2]);
								}
							}
							
							var p_unit = _data.records[0].paraminfo.unit;
							if(p_unit != ''){
								$('.detail-cont-table .span_unit').css('display', 'inline-block');
								$('.detail-cont-table .span_unit #i_unit').html(p_unit);
							}else{
								$('.detail-cont-table .span_unit').css('display', 'none');
							}
							
							var retypes = _data.records[0].paraminfo.reptype.paramdef;
							$('.condition2 select').append('<option value="M_0331">' + retypes.M_0331 + '</option>')
												   .append('<option value="M_0630">' + retypes.M_0630 + '</option>')
												   .append('<option value="M_0930">' + retypes.M_0930 + '</option>')
												   .append('<option value="M_1231">' + retypes.M_1231 + '</option>')
							
							_this.paramUrl = _data.records[0].paraminfo.paramurl;
							_this.paramcount = _data.records[0].paraminfo.paramcount;
						}else{
							$('.detail-cont-center .condition1').css('display', 'none');
							$('.detail-cont-center .condition2').css('display', 'none');
						}
						
						//变动日期 或 截止日期
						if(_data.records[0].paraminfo.sdate && _data.records[0].paraminfo.edate){
							$('.detail-cont-center .condition3').css('display', 'inline-block');
							$('.condition3 label').html(_data.records[0].paraminfo.sdate.paramname);
							
							var p_unit = _data.records[0].paraminfo.unit;
							if(p_unit != ''){
								$('.detail-cont-table .span_unit').css('display', 'inline-block');
								$('.detail-cont-table .span_unit #i_unit').html(p_unit);
							}else{
								$('.detail-cont-table .span_unit').css('display', 'none');
							}
							
							_this.paramUrl = _data.records[0].paraminfo.paramurl;
							_this.paramcount = _data.records[0].paraminfo.paramcount;
						}else{
							$('.detail-cont-center .condition3').css('display', 'none');
						}
						
						//分红年度
						if(_data.records[0].paraminfo.syear){
							$('.detail-cont-center .condition4').css('display', 'inline-block');
							$('.condition4 label').html(_data.records[0].paraminfo.syear.paramname);
							$('#se2_sele').attr('placeholder', '请输入或选择年份');
							
							var defTime = _data.records[0].paraminfo.syear.paramvalue;
							var se2_lis = $('#se2_editable-select-options ul li');
							for(var i = 0; i < defTime.length; i++){
								for(var j = 0; j < se2_lis.length; j++){
									$(se2_lis[0]).html(defTime[0]);
									$(se2_lis[1]).html(defTime[1]);
									$(se2_lis[2]).html(defTime[2]);
								}
							}
							
							var p_unit = _data.records[0].paraminfo.unit;
							if(p_unit != ''){
								$('.detail-cont-table .span_unit').css('display', 'inline-block');
								$('.detail-cont-table .span_unit #i_unit').html(p_unit);
							}else{
								$('.detail-cont-table .span_unit').css('display', 'none');
							}
							
							_this.paramUrl = _data.records[0].paraminfo.paramurl;
							_this.paramcount = _data.records[0].paraminfo.paramcount;
						}else{
							$('.detail-cont-center .condition4').css('display', 'none');
						}
					}else{
						$('.detail-cont-table .span_unit').css('display', 'none');
						$('.cont-right .detail-cont-center').css('display', 'none');
						$('.detail-cont-center .condition1').css('display', 'none');
						$('.detail-cont-center .condition2').css('display', 'none');
						$('.detail-cont-center .condition3').css('display', 'none');
						$('.detail-cont-center .condition4').css('display', 'none');
					}
				}else{
					$('.cont-right .detail-cont-center').css('display', 'none');
					$('.detail-cont-center .condition1').css('display', 'none');
					$('.detail-cont-center .condition2').css('display', 'none');
					$('.detail-cont-center .condition3').css('display', 'none');
					$('.detail-cont-center .condition4').css('display', 'none');
				}
			}
		});
	},
	getCondotionVal: function(){
		var _this = this;
		$('.detail-cont-btn .dataBrowseBtn').click(function(){
			$('.detail-cont-table .exportBtn').removeAttr('disabled');
			$('.detail-cont-table .exportBtn').css('cursor', 'pointer');
			
			_this.treeNodeClick(); //获取fullurl
			var f_url = _this.fullurl;			
			
			//获取已选择代码
			var codeArray = [];
			var selectSpans = $('.cont-top-right .selected-ul li span');
			for(var i=0;i<selectSpans.length;i++){
				codeArray.push(selectSpans[i].innerText);
			}
			
			//获取数据接口
			var p_url = _this.paramUrl;
			//获取条件查询的值
			if($('.condition1').css('display') == 'inline-block' && $('.condition2').css('display') == 'inline-block'){
				var repyear_val = $('.condition1 #se1').val();
				var reptype_val = $('.condition2').find('option:selected').val().split('_')[1];
				var defYear = new Date().Format('yyyy');
				
				//年份为空时，默认为当前年份
				if(repyear_val == ''){
					repyear_val = defYear;
				}
				p_url = p_url.replace(new RegExp('%repyear', 'gm'), repyear_val);
				p_url = p_url.replace(new RegExp('%reptype', 'gm'), reptype_val);
			} 
			if($('.condition3').css('display') == 'inline-block'){
				var sdate_val = $('#dBDatepair input.start').val();
				var edate_val = $('#dBDatepair input.end').val();
				
				p_url = p_url.replace('%sdate', sdate_val);
				p_url = p_url.replace('%edate', edate_val);
			} 
			if($('.condition4').css('display') == 'inline-block'){
				var syear_val = $('.condition4 #se2').val();
				var defYear = new Date().Format('yyyy');
				
				//年份为空时，默认为当前年份
				if(syear_val == ''){
					syear_val = defYear;
				}
				p_url = p_url.replace('%syear', syear_val);
			}
			
			//获取接口对应的ajax查询的代码数量的值
			var p_count = _this.paramcount;
			
			//获取已选择字段
			var tableParams = [];
			//获取已选择字段对应的属性名
			var columnParams = [];
			//获取右侧下部 已选择字段对应的span
			var chks = $('.detail-cont-bottom .selected-ul span');
			//存储已选择字段值的数组
			for(var i = 0; i < chks.length; i++) {
				tableParams.push({
					field: $(chks[i]).attr('data-alias'),
					title: chks[i].innerText,
					sortable: true
				});
				columnParams.push($(chks[i]).attr('data-alias'));
			}

			//将已选择的字段作为参数传递给 表格初始化方法
			_this.contentTableInit(tableParams, codeArray, f_url, p_url, p_count, columnParams);
		});
	},
	bottomUnselectLis: function(bottomUnselectData) {
		var _this = this;
		var outputParams = bottomUnselectData.outputParameter && JSON.parse(bottomUnselectData.outputParameter)
	    $('.detail-cont-bottom .unselect-ul').html('')
		
		var bottomLiArr, bottomLiArrLength;
		if(outputParams && outputParams.length) {
			bottomLiArr = outputParams.map(function(v, i) {
				var li = $('<li></li>');
				var lable = $('<label class="my_protocol"></label>');
				var inputs = $('<input type="checkbox" class="checkboxs" />');
				var i = $('<i></i>');
				var span = $('<span data-alias="' + v.fieldName + '" data-name="' + (v.fieldChineseName || v.fieldName) + '" data-id="' + bottomUnselectData.id + i + '">' + (v.fieldChineseName || v.fieldName) + '</span>');
				lable.append(inputs);
				lable.append(i);
				lable.append(span);
				li.append(lable);
				return li;
			});
			bottomLiArrLength = bottomLiArr.length;
		}else{
			$('.detail-cont-bottom .unselect-ul').html('无数据');
			bottomLiArrLength = 0;
		}
		
		_this.bottomLeftRight(bottomLiArrLength);
		return bottomLiArr;
	},
	bottomLeftRight: function(bottomLiArrLength) {
		var unselectcount = $(".detail-cont-bottom #unselectcount");
		var selectedcount = $(".detail-cont-bottom #selectedcount");
		
		//实时动态显示可选择字段和已选择字段的数量
		unselectcount.eq(0).text(bottomLiArrLength);
		selectedcount.eq(0).text($('.detail-cont-bottom .selected-ul li').length);
		
		//全选函数
		$('.detail-cont-bottom .checkbox-all').click(function() {
			if($(this).prop('checked')) {
				$(this).parent().parent().nextAll().find('.checkboxs').prop('checked', true);
			} else {
				$(this).parent().parent().nextAll().find('.checkboxs').prop('checked', false);
			}
		});
		
		//单个checkbox与全选的关系函数
		$('.detail-cont-bottom .select-content').off().on('click', 'span', function(e) {
			var checkedAll = $(this).parents('.select-content').prevAll().find('.checkbox-all');
			var checkboxs = $(this).parent().find('checkboxs').prop('checked');
			if(!checkboxs && checkedAll.prop('checked')) { //有单个没选中，且全选框选中，取消全选框选中状态
				checkedAll.prop('checked', false);
			} else if(checkboxs && !checkedAll.prop('checked')) { //单个选中，且全选框未选中
				var lis = $(this).parents('ul').children();
				for(var i = 0; i < lis.length; i++) {
					if($(lis[i]).children().find('.checkboxs').prop('checked')) {
						if(i == lis.length - 1) { //单个选中的数量 == 所有li的数量 时，表示li被全部选中
							checkedAll.prop('checked', true);
						}
					} else {
						break;
					}
				}
			}
		});
		
		//左右移按钮点击事件
		$('.detail-cont-bottom .arrow-btn').off().on('click', function(){
			var checkboxs, origin, target;
			var num = 0;
			if($(this).hasClass('right')) {
				origin = $('.detail-cont-bottom .unselect-ul');
				target = $('.detail-cont-bottom .selected-ul');
			} else {
				origin = $('.detail-cont-bottom .selected-ul');
				target = $('.detail-cont-bottom .unselect-ul');
			}
			
			checkboxs = origin.find('.checkboxs');
			for(var i = 0; i < checkboxs.length; i++) {
				if($(checkboxs[i]).prop('checked')) {
					var that = $(checkboxs[i]).parent().parent().clone();
					target.append(that);
					that.children().children('input').prop('checked', false);
					$(checkboxs[i]).parent().parent().remove();
				} else {
					num++;
				}
			}
			
			//在一侧点击全选移动之后，该侧的全选按钮应该取消选中
			$(".detail-cont-bottom .checkbox-all").prop("checked", false);
			
			//实时动态显示可选择字段和已选择字段的数量
			unselectcount.eq(0).text($('.detail-cont-bottom .unselect-ul li').length);
			selectedcount.eq(0).text($('.detail-cont-bottom .selected-ul li').length);

			if(checkboxs.length == num) {
				alert('请至少选择一个字段操作');
			} else {
				origin.parent().prev().find('.checkbox-all').prop('checked', false);
			}
		});
	},
	keysSearchLeft: function() {
		var _this = this;
		$('.detail-cont-bottom .keys-search-left i').click(function() {
			var val = ($(this).prev().val());
			$('.detail-cont-bottom .unselect-ul').css('height', '100%').css('visibility', 'visible');

			if(val) {
				_this.findKeysLeft(val);
			} else {
				$('.detail-cont-bottom .unselect-ul').find('li').show();
			}
		});
	},
	findKeysLeft: function(val) {
		var result_span = $('.detail-cont-bottom .unselect-ul').find('span[data-name*=' + val + ']');
		if(!result_span.length) {
			$('.detail-cont-bottom .unselect-ul').css('height', '0px').css('visibility', 'hidden');
			return;
		}
		$('.detail-cont-bottom .unselect-ul').find('li').removeAttr('id').show();
		result_span.show();
		result_span.parents('li').attr('id', 'result_span')
		result_span.parents('li').parent().find('>li:not([id=result_span])').hide();
	},
	//表格数据加载
	contentTableInit: function(tableParams, codeArray, fullurl, p_url, p_count, columnParams) {
		var _this = this;
		var datasss = [];
		if(tableParams.length == 0) {
			easyDialog.open({
				container: {
					content: '请选择至少一个输出字段!',
					yesFn: function(){
					}
				}
			});
			return;
		}else{
			if(codeArray.length == 0) {
				easyDialog.open({
					container: {
						content: '请选择至少一个证券代码!',
						yesFn: function(){
						}
					}
				});
				return;
			}else{
				$('.detail-cont-table #contentTable').bootstrapTable('destroy');
				$('.detail-cont-table').css('display', 'block');
				$('.detail-cont-table .exportBtn').show();
				$('.detail-cont-table .span_target .onloading').css('display', 'inline');
				$('.detail-cont-table .span_target .tips').css('display', 'none');
				$('.detail-cont-table .span_target .cancel').css('display', 'none');
				$('.detail-cont-table .span_target .timeout').css('display', 'none');
				$('.detail-cont-table .span_target .sysbusy').css('display', 'none');
				
				var obj = [];
				var scodes = [];
				for(var i = 0; i < codeArray.length; i++) {
					scodes.push(codeArray[i].split('-')[0]);
				}
				
				var codeLen = scodes.length; //已选择的代码个数
				var codeList = []; //代码分批次数组
				var resultTotal = 0; //请求返回的数据量
				
				if(p_count == 'undefined' || p_count == 0){
					p_count = 300;
				}
				var times = Math.ceil((codeLen-20)/p_count + 1); //ajax请求的次数
				
				if(codeLen <= 20){ //代码个数在20个以内时
					for(var i = 0; i < codeLen; i++){
						codeList.push(scodes[i]);
					}
					var ajaxTimeOut = $.ajax({
						type: 'post',
						url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
						dataType: 'json',
						timeout: 11000,
						success: function(ress) {
							if(ress.resultmsg == 'success'){
								resultTotal += ress.records.length;
								if(resultTotal <= 20000){
									$('.detail-cont-table .span_target .tips').css('display', 'none');
									
									$.each(ress.records, function(i, d) {
										obj.push(d);
									});
									$(".detail-cont-table #contentTable").html('');
									$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
										data: obj,
										pagination: true,
										pageList: [10, 20, 50],
										columns: tableParams
									});
									
									for(var i = 0; i < ress.records.length; i++){
										datasss.push(ress.records[i]);
									}
								}else{
									$('.detail-cont-table .span_target .onloading').css('display', 'none');
									$('.detail-cont-table .span_target .tips').css('display', 'inline');
									
									var new_records = [];
									for(var j = 0; j < 20000; j++){
										new_records.push(ress.records[j]);
									}
									
									$.each(new_records, function(i, d) {
										obj.push(d);
									});
									$(".detail-cont-table #contentTable").html('');
									$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
										data: obj,
										pagination: true,
										pageList: [10, 20, 50],
										columns: tableParams
									});
									
									for(var i = 0; i < new_records.length; i++){
										datasss.push(new_records[i]);
									}
								}
								
								//初始化表格鼠标悬停展示单元格信息
								$('#showbox').hide();
								$('.bootstrap-table tr td').mouseover(function(e){
									$(this).css('cursor', 'pointer');
									$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
									$('#showbox').html($(this).text());
									$('#showbox').show();
								});
								$('.bootstrap-table tr td').mousemove(function(e){
									$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
								});
								$('.bootstrap-table tr td').mouseout(function(){
									$(this).css('cursor', '');
									$('#showbox').hide();
								});
							}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
								$('.detail-cont-table .span_target .timeout').css('display', 'inline');
							}else{
								$('.detail-cont-table .fixed-table-pagination').hide();
								$('.detail-cont-table .exportBtn').hide();
								$('.detail-cont-table .span_target .onloading').css('display', 'none');
								$('.detail-cont-table .span_target .tips').css('display', 'none');
								$('.detail-cont-table .span_target .cancel').css('display', 'none');
								$('.detail-cont-table .span_target .timeout').css('display', 'none');
								$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
							}
						},
						error: function(XMLHttpRequest, textStatus, errorThrown){
							if(resultTotal < 20000){
								$('.detail-cont-table .span_target .cancel').css('display', 'inline');
							}
						},
						complete: function(XMLHttpRequest, status){
							$('.detail-cont-table .span_target .onloading').css('display', 'none');
							if(status == 'error'){
								ajaxTimeOut.abort();
							}
						}
					});
				}else{ //代码超过20个
					if(codeLen <= p_count + 20){ //代码超过20个，但不超过 p_count+20 个
						resultTotal = 0;
						
						//前20个代码集合
						for(var i = 1; i <= 20; i++){
							codeList.push(scodes[i-1]);
						}
						var ajaxTimeOut = $.ajax({
							type: 'post',
							url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
							dataType: 'json',
							timeout: 11000,
							success: function(ress) {
								if(ress.resultmsg == 'success'){
									resultTotal += ress.records.length;
									if(resultTotal <= 20000){
										$('.detail-cont-table .span_target .tips').css('display', 'none');
										
										$.each(ress.records, function(i, d) {
											obj.push(d);
										});
										$(".detail-cont-table #contentTable").html('');
										$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
											data: obj,
											pagination: true,
											pageList: [10, 20, 50],
											columns: tableParams
										});
										
										for(var i = 0; i < ress.records.length; i++){
											datasss.push(ress.records[i]);
										}
									}else{
										$('.detail-cont-table .span_target .onloading').css('display', 'none');
										$('.detail-cont-table .span_target .tips').css('display', 'inline');
									
										var new_records = [];
										for(var j = 0; j < 20000; j++){
											new_records.push(ress.records[j]);
										}
										
										$.each(new_records, function(i, d) {
											obj.push(d);
										});
										$(".detail-cont-table #contentTable").html('');
										$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
											data: obj,
											pagination: true,
											pageList: [10, 20, 50],
											columns: tableParams
										});
										
										for(var i = 0; i < new_records.length; i++){
											datasss.push(new_records[i]);
										}
									}
									
									//初始化表格鼠标悬停展示单元格信息
									$('#showbox').hide();
									$('.bootstrap-table tr td').mouseover(function(e){
										$(this).css('cursor', 'pointer');
										$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
										$('#showbox').html($(this).text());
										$('#showbox').show();
									});
									$('.bootstrap-table tr td').mousemove(function(e){
										$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
									});
									$('.bootstrap-table tr td').mouseout(function(){
										$(this).css('cursor', '');
										$('#showbox').hide();
									});
								}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
									$('.detail-cont-table .span_target .timeout').css('display', 'inline');
								}else{
									$('.detail-cont-table .fixed-table-pagination').hide();
									$('.detail-cont-table .exportBtn').hide();
									$('.detail-cont-table .span_target .onloading').css('display', 'none');
									$('.detail-cont-table .span_target .tips').css('display', 'none');
									$('.detail-cont-table .span_target .cancel').css('display', 'none');
									$('.detail-cont-table .span_target .timeout').css('display', 'none');
									$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
								}
							},
							error: function(XMLHttpRequest, textStatus, errorThrown){
								if(resultTotal < 20000){
									$('.detail-cont-table .span_target .cancel').css('display', 'inline');
								}
							},
							complete: function(XMLHttpRequest, status){
								if(status == 'error'){
									ajaxTimeOut.abort();
								}
							}
						});	
						
						//第二次
						codeList = [];
						for(var j = (times-2)*p_count+20; j < codeLen; j++){
							codeList.push(scodes[(j)]);
						}
						setTimeout(function(){
							var ajaxTimeOut2 = $.ajax({
								type: 'post',
								url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
								dataType: 'json',
								timeout: 11000,
								success: function(ress){
									if(ress.resultmsg == 'success'){
										$('.detail-cont-table .fixed-table-pagination').show();
										$('.detail-cont-table .exportBtn').show();
										$('.detail-cont-table .span_target .sysbusy').css('display', 'none');
										
										resultTotal += ress.records.length;
										if(resultTotal <= 20000){
											$('.detail-cont-table .span_target .tips').css('display', 'none');
											$('#contentTable').bootstrapTable('append', ress.records);
											
											for(var i = 0; i < ress.records.length; i++){
												datasss.push(ress.records[i]);
											}
										}else{
											$('.detail-cont-table .span_target .onloading').css('display', 'none');
											$('.detail-cont-table .span_target .tips').css('display', 'inline');
											
											var new_records = [];
											for(var j = 0; j < ress.records.length - (resultTotal - 20000); j++){
												new_records.push(ress.records[j]);
											}
											$('#contentTable').bootstrapTable('append', new_records);
											
											for(var i = 0; i < new_records.length; i++){
												datasss.push(new_records[i]);
											}
										}
										
										//初始化表格鼠标悬停展示单元格信息
										$('#showbox').hide();
										$('.bootstrap-table tr td').mouseover(function(e){
											$(this).css('cursor', 'pointer');
											$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
											$('#showbox').html($(this).text());
											$('#showbox').show();
										});
										$('.bootstrap-table tr td').mousemove(function(e){
											$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
										});
										$('.bootstrap-table tr td').mouseout(function(){
											$(this).css('cursor', '');
											$('#showbox').hide();
										});
									}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
										$('.detail-cont-table .span_target .timeout').css('display', 'inline');
									}else{
										$('.detail-cont-table .fixed-table-pagination').hide();
										$('.detail-cont-table .exportBtn').hide();
										$('.detail-cont-table .span_target .onloading').css('display', 'none');
										$('.detail-cont-table .span_target .tips').css('display', 'none');
										$('.detail-cont-table .span_target .cancel').css('display', 'none');
										$('.detail-cont-table .span_target .timeout').css('display', 'none');
										$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
									}
								},
								error: function(XMLHttpRequest, textStatus, errorThrown){
									if(resultTotal < 20000){
										$('.detail-cont-table .span_target .cancel').css('display', 'inline');
									}
								},
								complete: function(XMLHttpRequest, status){
									$('.detail-cont-table .span_target .onloading').css('display', 'none');
									if(status == 'error'){
										ajaxTimeOut2.abort();
									}
								}
							});
						}, 500);
					}else{ //代码超过 p_count+20 个
						resultTotal = 0;
						
						//前20个代码集合
						for(var i = 1; i <= 20; i++){
							codeList.push(scodes[i-1]);
						}
						var ajaxTimeOut = $.ajax({
							type: 'post',
							url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
							dataType: 'json',
							timeout: 11000,
							success: function(ress) {
								if(ress.resultmsg == 'success'){
									resultTotal += ress.records.length;
									if(resultTotal <= 20000){
										$('.detail-cont-table .span_target .tips').css('display', 'none');
										
										$.each(ress.records, function(i, d) {
											obj.push(d);
										});
										$(".detail-cont-table #contentTable").html('');
										$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
											data: obj,
											pagination: true,
											pageList: [10, 20, 50],
											columns: tableParams
										});
										
										for(var i = 0; i < ress.records.length; i++){
											datasss.push(ress.records[i]);
										}
									}else{
										$('.detail-cont-table .span_target .onloading').css('display', 'none');
										$('.detail-cont-table .span_target .tips').css('display', 'inline');
										
										var new_records = [];
										for(var j = 0; j < 20000; j++){
											new_records.push(ress.records[j]);
										}
										
										$.each(new_records, function(i, d) {
											obj.push(d);
										});
										$(".detail-cont-table #contentTable").html('');
										$(".detail-cont-table #contentTable").bootstrapTable('destroy').bootstrapTable({
											data: obj,
											pagination: true,
											pageList: [10, 20, 50],
											columns: tableParams
										});
										
										for(var i = 0; i < new_records.length; i++){
											datasss.push(new_records[i]);
										}
									}
									
									//初始化表格鼠标悬停展示单元格信息
									$('#showbox').hide();
									$('.bootstrap-table tr td').mouseover(function(e){
										$(this).css('cursor', 'pointer');
										$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
										$('#showbox').html($(this).text());
										$('#showbox').show();
									});
									$('.bootstrap-table tr td').mousemove(function(e){
										$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
									});
									$('.bootstrap-table tr td').mouseout(function(){
										$(this).css('cursor', '');
										$('#showbox').hide();
									});
								}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
									$('.detail-cont-table .span_target .timeout').css('display', 'inline');
								}else{
									$('.detail-cont-table .fixed-table-pagination').hide();
									$('.detail-cont-table .exportBtn').hide();
									$('.detail-cont-table .span_target .onloading').css('display', 'none');
									$('.detail-cont-table .span_target .tips').css('display', 'none');
									$('.detail-cont-table .span_target .cancel').css('display', 'none');
									$('.detail-cont-table .span_target .timeout').css('display', 'none');
									$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
								}
							},
							error: function(XMLHttpRequest, textStatus, errorThrown){
								if(resultTotal < 20000){
									$('.detail-cont-table .span_target .cancel').css('display', 'inline');
								}
							},
							complete: function(XMLHttpRequest, status){
								if(status == 'error'){
									ajaxTimeOut.abort();
								}
							}
						});
						
						//最后一次
						setTimeout(function(){
							codeList = [];
							for(var j = (times-2)*p_count+20; j < codeLen; j++){
								codeList.push(scodes[(j)]);
							}
							var ajaxTimeOut3 = $.ajax({
								type: 'post',
								url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
								dataType: 'json',
								timeout: 11000,
								success: function(ress){
									if(ress.resultmsg == 'success'){
										$('.detail-cont-table .fixed-table-pagination').show();
										$('.detail-cont-table .exportBtn').show();
										$('.detail-cont-table .span_target .sysbusy').css('display', 'none');
										
										resultTotal += ress.records.length;
										if(resultTotal <= 20000){
											$('.detail-cont-table .span_target .tips').css('display', 'none');
											$('#contentTable').bootstrapTable('append', ress.records);
											
											for(var i = 0; i < ress.records.length; i++){
												datasss.push(ress.records[i]);
											}
										}else{
											$('.detail-cont-table .span_target .onloading').css('display', 'none');
											$('.detail-cont-table .span_target .tips').css('display', 'inline');
											
											var new_records = [];
											for(var j = 0; j < ress.records.length - (resultTotal - 20000); j++){
												new_records.push(ress.records[j]);
											}
											$('#contentTable').bootstrapTable('append', new_records);
											
											for(var i = 0; i < new_records.length; i++){
												datasss.push(new_records[i]);
											}
										}
										
										//初始化表格鼠标悬停展示单元格信息
										$('#showbox').hide();
										$('.bootstrap-table tr td').mouseover(function(e){
											$(this).css('cursor', 'pointer');
											$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
											$('#showbox').html($(this).text());
											$('#showbox').show();
										});
										$('.bootstrap-table tr td').mousemove(function(e){
											$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
										});
										$('.bootstrap-table tr td').mouseout(function(){
											$(this).css('cursor', '');
											$('#showbox').hide();
										});
									}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
										$('.detail-cont-table .span_target .timeout').css('display', 'inline');
									}else{
										$('.detail-cont-table .fixed-table-pagination').hide();
										$('.detail-cont-table .exportBtn').hide();
										$('.detail-cont-table .span_target .onloading').css('display', 'none');
										$('.detail-cont-table .span_target .tips').css('display', 'none');
										$('.detail-cont-table .span_target .cancel').css('display', 'none');
										$('.detail-cont-table .span_target .timeout').css('display', 'none');
										$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
									}
								},
								error: function(XMLHttpRequest, textStatus, errorThrown){
									if(resultTotal < 20000){
										$('.detail-cont-table .span_target .cancel').css('display', 'inline');
									}
								},
								complete: function(XMLHttpRequest, status){
									if(status == 'error'){
										ajaxTimeOut3.abort();
									}
								}
							});
						}, 300);
						
						//代码个数超过20个时，ajax请求的次数循环
						setTimeout(function(){
							var m_count = 0;
							for(var i = 1; i <= times - 2; i++){
								codeList = [];
								for(var j = 1; j <= p_count; j++){
									codeList.push(scodes[(i-1)*p_count + 20 + (j-1)]);
								}
								var ajaxTimeOut2 = $.ajax({
									type: 'post',
									url: fullurl + '?scode=' + codeList + p_url + '&@column=' + columnParams,
									dataType: 'json',
									timeout: 11000,
									success: function(ress){
										if(ress.resultmsg == 'success'){
											$('.detail-cont-table .fixed-table-pagination').show();
											$('.detail-cont-table .exportBtn').show();
											$('.detail-cont-table .span_target .sysbusy').css('display', 'none');
											
											resultTotal += ress.records.length;
											if(resultTotal <= 20000){
												$('.detail-cont-table .span_target .tips').css('display', 'none');
												$('#contentTable').bootstrapTable('append', ress.records);
												
												for(var i = 0; i < ress.records.length; i++){
													datasss.push(ress.records[i]);
												}
											}else{
												$('.detail-cont-table .span_target .onloading').css('display', 'none');
												$('.detail-cont-table .span_target .tips').css('display', 'inline');
												
												var new_records = [];
												for(var j = 0; j < ress.records.length - (resultTotal - 20000); j++){
													new_records.push(ress.records[j]);
												}
												$('#contentTable').bootstrapTable('append', new_records);
												
												for(var i = 0; i < new_records.length; i++){
													datasss.push(new_records[i]);
												}
											}
											
											//初始化表格鼠标悬停展示单元格信息
											$('#showbox').hide();
											$('.bootstrap-table tr td').mouseover(function(e){
												$(this).css('cursor', 'pointer');
												$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
												$('#showbox').html($(this).text());
												$('#showbox').show();
											});
											$('.bootstrap-table tr td').mousemove(function(e){
												$('#showbox').css({'top': e.pageY - 70, 'left': e.pageX + 5});
											});
											$('.bootstrap-table tr td').mouseout(function(){
												$(this).css('cursor', '');
												$('#showbox').hide();
											});
										}else if(ress.resultmsg == '请求的数据量过大，请减少单次请求的数据量'){
											$('.detail-cont-table .span_target .timeout').css('display', 'inline');
										}else{
											$('.detail-cont-table .fixed-table-pagination').hide();
											$('.detail-cont-table .exportBtn').hide();
											$('.detail-cont-table .span_target .onloading').css('display', 'none');
											$('.detail-cont-table .span_target .tips').css('display', 'none');
											$('.detail-cont-table .span_target .cancel').css('display', 'none');
											$('.detail-cont-table .span_target .timeout').css('display', 'none');
											$('.detail-cont-table .span_target .sysbusy').css('display', 'inline');
										}
									},
									error: function(XMLHttpRequest, textStatus, errorThrown){
										if(resultTotal < 20000){
											$('.detail-cont-table .span_target .cancel').css('display', 'inline');
										}
									},
									complete: function(XMLHttpRequest, status){
										m_count++;
										if(m_count == times - 2){
											$('.detail-cont-table .span_target .onloading').css('display', 'none');
										}
										if(status == 'error'){
											ajaxTimeOut2.abort();
										}
									}
								});
								
								//每两次循环间隔时间50ms
								_this.sleep(50);
							}
						}, 800);
					}
				}
			}
		}
		
		_this.downloadExl(datasss, null, tableParams);
	},
	//延迟执行方法
	sleep: function(numberMillis){
		var nowMillis = new Date();
		var exitMillis = nowMillis.getTime() + numberMillis;
		while(true){
			nowMillis = new Date();
			if(nowMillis.getTime() > exitMillis){
				return;
			}
		}
	},
	downloadExl: function(json, type, tableParams){
		var _this = this;
		$('.exportBtn').off().on('click', function(){
			//登录判断
			var isLogin = localStorage.getItem("login");
			if(!isLogin){
				$('#myModal').modal('show');
				return;
			}
			
			$('.detail-cont-table .exportBtn').prop('disabled', 'disabled');
			$('.detail-cont-table .exportBtn').css('cursor', 'not-allowed');

				
			var tmpdata = json[0];
			var json2 = json;
			json2.unshift({});
			
			var keyMap = []; //获取keys
			for(var i = 0; i < tableParams.length; i++){
				for(var k in tmpdata) {
					if(k == tableParams[i].field){
						keyMap.push(k);
						json2[0][k] = tableParams[i].title;
						break;
					}
				}
			}
			
			tmpDown = new Blob(
				[_this.exportJson2Excel(json2, 'xls')], 
				{type: ""}
			);
			_this.saveAs(tmpDown, "Excel_" + new Date().getTime() + '.xls');
			json = [];
				
		});
	},
	saveAs: function(obj, fileName){
		if(!!window.ActiveXObject || "ActiveXObject" in window){
			window.navigator.msSaveOrOpenBlob(obj, "Excel_" + new Date().getTime() + '.xls');
		}else{
			var tmpa = document.createElement("a");
			tmpa.download = fileName || "下载";
			tmpa.href = URL.createObjectURL(obj);
			document.body.appendChild(tmpa); //在火狐浏览器中下载时，必须将a标签放在body内部
			tmpa.click();
		}
		setTimeout(function() {
			URL.revokeObjectURL(obj);
			document.body.removeChild(tmpa);
		}, 100);
	},
    exportJson2Excel: function(json, type){
		var _this = this;
		var title = new Array(); 
		_this.getProFromObject(json[0], title);
		
		var data = [];
		for (var i = 0; i < json.length; i++) {
			var r = json[i];
			var dataRow = [];
			title.forEach(function (t) {
				var d1 = r[t];
				var ss = t.split(".");
				if (ss.length >= 2) {
					var tmp = r;
					for (var i = 0; i < ss.length; i++) {
						var s = ss[i];
						tmp = tmp[s];
						if (!tmp) {
							break;
						}
					}
					d1 = tmp;
				}
				if (d1 || d1 == 0) {
					dataRow.push(d1);
				} else {
					dataRow.push("");
				}
			});
			data.push(dataRow);
		}
		return  _this.jsonToExcelConvertor(data, title, type);
    },
    getProFromObject: function (r, title, parentsPros){
        var _this = this;
        for (var rp in r) {
            if (parentsPros) {
                title.push(parentsPros + "." + rp);
            } else {
                title.push(rp);
            }
            if (typeof r[rp] == 'object') {
                if (parentsPros) {
                    _this.getProFromObject(r[rp], title, parentsPros + "." + rp);
                } else {
                    _this.getProFromObject(r[rp], title, rp);
                }
            }
        }
    },
    jsonToExcelConvertor: function (JSONData, ShowLabel, type){
        type = type ? type : "xls";
        var application = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (type == "xls") {
            application = "application/vnd.ms-excel";
        }

        // 先转化json
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        //设置数据内容表格
        var excel = '<table>';
        // 设置数据
        for (var i = 0; i < arrData.length; i++) {
            var row = '<tr>';
            for (var index = 0; index < arrData[i].length; index++) {
                var value =  arrData[i][index] === '.' ? '' : arrData[i][index];
                row += '<td style="mso-number-format:\'\\\@\'">' + value + '</td>';
            }
            excel += row + '</tr>';
        }
        excel += '</table>';

        var excelFile = '<html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:x=\'urn:schemas-microsoft-com:office:excel\' xmlns=\'http://www.w3.org/TR/REC-html40\'>';
	        excelFile += '<meta http-equiv="content-type" content="' + application + '; charset=UTF-8">';
	        excelFile += '<meta http-equiv="content-type" content="' + application;
	        excelFile += '; charset=UTF-8">';
	        excelFile += '<head>';
	        excelFile += '<!--[if gte mso 9]>';
	        excelFile += '<xml>';
	        excelFile += '<x:ExcelWorkbook>';
	        excelFile += '<x:ExcelWorksheets>';
	        excelFile += '<x:ExcelWorksheet>';
	        excelFile += '<x:Name>';
	        excelFile += '{worksheet}';
	        excelFile += '</x:Name>';
	        excelFile += '<x:WorksheetOptions>';
	        excelFile += '<x:DisplayGridlines/>';
	        excelFile += '</x:WorksheetOptions>';
	        excelFile += '</x:ExcelWorksheet>';
	        excelFile += '</x:ExcelWorksheets>';
	        excelFile += '</x:ExcelWorkbook>';
	        excelFile += '</xml>';
	        excelFile += '<![endif]-->';
	        excelFile += '</head>';
	        excelFile += '<body>';
	        excelFile += excel; //数据内容写在这里
	        excelFile += '</body>';
	        excelFile += '</html>';
		return excelFile;
    }
}