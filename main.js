   //переменные
	var match, expr;
	var input = document.querySelector('.input');
    var input2 = document.querySelector('.output');
   //переменные end	
   //окружение
    var topEnv = {};

    topEnv["true"] = true;
    topEnv["false"] = false;
    
	
	topEnv["print"] = function(value) {
     //console.log(value);
     input2.value += value;
    };
	

    //окружение end
	//операторы
	var operators={};
	
	["+", "-", "*", "/", "==","!=", "<", ">","%"].forEach(function (op) {
        operators[op] = new Function("a, b", "return a " + op + " b;");
    });
	//операторы end
	//специальные формы
	var specialForms = {};
	
	specialForms["print"] = function(args) {
     //console.log(value);
     input2.value += args;
    };
	
	specialForms["printer"] = function(value) {
     print(value);
    };
	specialForms["alert"] = function(args) {
     alert(value);
    };
	
	specialForms["if"] = function(args) {
     if (args.length != 3)
      throw new SyntaxError("Неправильное количество аргументов для if");

     if (evaluate(args[0], env) !== false)
      return evaluate(args[1], env);
     else
      return evaluate(args[2], env);
    };
	
	specialForms["var"] = function(args, env) {
     if (args.length != 2 || args[0].type != "word")
      throw new SyntaxError("Bad use of var");
     var value = evaluate(args[1], env);
     env[args[0].name] = value;
     return value;
    };
	
	
	specialForms["while"] = function(args, env) {
       if (args.length != 2)
         throw new SyntaxError("Неправильное количество аргументов для while");
       
       while (evaluate(args[0], env) !== false)
         evaluate(args[1], env);
       
       // за отсутствием осмысленного результата возвращаем false
       return false;
    };
	
	specialForms["do"] = function(args, env) {
      var value = false;
      args.forEach(function(arg) {
        value = evaluate(arg, env);
      });
      return value;
    };
  
  specialForms["function"] = function(args, env) {
  if (!args.length)
    throw new SyntaxError("Функции нужно тело");
  function name(expr) {
    if (expr.type != "word")
      throw new SyntaxError("Имена аргументов должны быть типа word");
    return expr.name;
  }
  var argNames = args.slice(0, args.length - 1).map(name);
  var body = args[args.length - 1];

  return function() {
    if (arguments.length != argNames.length)
      throw new TypeError("Неверное количество аргументов");
    var localEnv = Object.create(env);
    for (var i = 0; i < arguments.length; i++)
      localEnv[argNames[i]] = arguments[i];
    return evaluate(body, localEnv);
   };
  };
	//специальные формы end


function parseExpression(program) {
	
        program = skipSpace(program);
		
        if (match = /^"([^"]*)"/.exec(program))// определение если сначало идет строка
            expr = { type: "value", value: match[1] };
		else if (match = /^'([^']*)'/.exec(program))// определение если сначало идет строка
            expr = { type: "value", value: match[1] };
        else if (match = /^\d+\b/.exec(program))// определение если сначало идет сколько угодно цыфр и заканчивается цыфрой
            expr = { type: "value", value: Number(match[0]) };
		else if (match = /^[^\s(),"=\+\*-/%><!]+/.exec(program))//первый элемент не строка не круглые скобки не запятая и не двойные кавычки, встречаются от 1 и более раз            
			expr = { type: "word", name: match[0] };
		
        else{
			input2.style.color = "Red";
			input2.value="Неожиданный синтаксис: " + program
            throw new SyntaxError("Неожиданный синтаксис: " + program);
		}
        		
	 return expr;
    }
	
	function parseApply(program) {
     body=[]
	 while((program = skipSpace(program))!=""){

      expr=parseExpression(program)	  
	  if(expr.name=="var") {//если обьявление переменной
		  
		 program=program.slice(expr.name.length)
         id=parseExpression(program)
         program = skipSpace(program);		 
         program=program.slice(id.name.length+1)
         init=parseExpression(program)
		 if(typeof init.value === 'string')
		   program=program.slice(init.value.length+2)  
		 else
           program=program.slice(getLength(init.value))
		 
		 body.push({type:"VariableDeclaration",
		 declarations:{
        
           id: id,
           init: init
        
		   }
	      }
	     )	  
	    }
      else if(expr.name in specialForms) {//если особое слово
		 arguments=[]
         expression = expr		 
		 program = program.slice(expr.name.length)
		 program = skipSpace(program);
         program=program.slice(1)
		 arguments.push(parseExpression(program))
		 
		 if (arguments[0].type=="value")
		  if(typeof arguments[0].value === 'string')
		   program=program.slice(arguments[0].value.length+2)  
		  else
           program=program.slice(getLength(arguments[0].value))
	     else if (arguments[0].type=="word")
		   program=program.slice(arguments[0].name.length)
	   
	     if(program[0] in operators){
			operator={ type: "operator", name: program[0] };//заменить
			program=program.slice(operator.name.length)
			
			arguments.push(parseExpression(program))
		 
		   if (arguments[1].type=="value")
		    if(typeof arguments[1].value === 'string')
		     program=program.slice(arguments[1].value.length+2)  
		    else
             program=program.slice(getLength(arguments[1].value))
	       else if (arguments[1].type=="word")
		     program=program.slice(arguments[1].name.length)
		 }
         else if(program[0]==")"){		
	        operator=""
			program=program.slice(1)
		 }
		 
		 if(program[0]==")"){		
			program=program.slice(1)
		 }
		 
		
         body.push({type:"ExpressionStatement",
		 declarations:{
        
          expression: expression,
		  operator: operator, 
          arguments: arguments          
        
		 }
	    }
	   )		 	     
	  
	  }
      else if(program[0]=="{") {//если обьявление тела
		 arguments=[]
	     while(program[0]=="}")
		  inbody.push() 
         body.push({type:"BlockStatement",
		 inbody:inbody
	    }
	   )		 	     
	  
	  }	  
	  else{
	   input2.style.color = "Red";
	   input2.value="Неожиданный синтаксис: " + program
	   throw new SyntaxError("Неожиданный синтаксис: " + program);
	  }
	 }
	 return body;
	}
	
	function evaluate(body) {
     for(i=0;i<body.length;i++)
     switch(body[i].type) {
    case "VariableDeclaration":
      topEnv[body[i].declarations.id.name]=body[i].declarations.init.value
      break;
    case "ExpressionStatement":
	var args=[];
	var arguments=body[i].declarations.arguments
	var argslen=arguments.length
	
	 for(arg=0;arg< argslen;arg++){
	  if(arguments[arg].name in topEnv){//если переменная
	    args.push(topEnv[arguments[arg].name])	    
	  }else
        args.push(arguments[arg].value);
     }
	 
	  if(body[i].declarations.operator!="")//если есть оператор
		 args[0]=operators[body[i].declarations.operator.name](args[0],args[1])
	  
	  if(body[i].declarations.expression.name=="if"){
		if(args[0]==false)
		 i++
	   }	 
	  else
	    specialForms[body[i].declarations.expression.name](args[0])
      break;
    default:
     alert( 'Я таких обьявлений не знаю' );
	}
   }
	
	
	function skipSpace(str) {
		//var first = str.search(/^[\/]+.*/);
		if (str[0]=="/" && str[1]=="/"){
         first = str.search(/\n/);
		 str=str.slice(first);
		}
        first = str.search(/\S/);
        if (first == -1) return "";
        return str.slice(first);
    }
	
	function getLength(number) {
       return String(number).length;
	//String(number).replace('.', '').length
	//String(number).match(/\d/g).length
    }

var keys = document.querySelectorAll('.BTN');
    keys[0].onclick = function(e) 
  {	
    input2.style.color = "Black";
	input2.value = "";
    evaluate(parseApply(input.value));
	//evaluate(parseApply("print(1+2)"));
    e.preventDefault();
  }