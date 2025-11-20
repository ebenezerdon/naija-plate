(function(w){
  'use strict';
  w.App = w.App || {};

  // Storage wrapper under App namespace
  w.App.Store = {
    get: function(key, fallback){
      try{
        var raw = localStorage.getItem(key);
        if(!raw) return fallback;
        return JSON.parse(raw);
      }catch(e){
        console.error('Storage get failed', e);
        return fallback;
      }
    },
    set: function(key, value){
      try{ localStorage.setItem(key, JSON.stringify(value)); }
      catch(e){ console.error('Storage set failed', e); }
    },
    remove: function(key){ try{ localStorage.removeItem(key); }catch(e){} }
  };

  // Utilities
  w.App.Utils = {
    uuid: function(){ return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36); },
    slugify: function(str){ return String(str||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); },
    debounce: function(fn, wait){ var t; return function(){ var ctx=this, args=arguments; clearTimeout(t); t=setTimeout(function(){ fn.apply(ctx,args); }, wait); }; },
    groupBy: function(arr, keyFn){ var m={}; (arr||[]).forEach(function(it){ var k=keyFn(it); m[k]=m[k]||[]; m[k].push(it); }); return m; },
    toClipboard: function(text){
      if(navigator && navigator.clipboard && navigator.clipboard.writeText){ return navigator.clipboard.writeText(text); }
      var ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){} document.body.removeChild(ta); return Promise.resolve();
    }
  };
  // Asset URL helper to produce absolute URLs from relative asset paths
  w.App.asset = function(path){
    if(!path) return '';
    // Pass through absolute/data/blob URLs
    if(/^(data:|blob:|https?:|\/\/)/i.test(path)) return path;
    try {
      return new URL(path, document.baseURI).toString();
    } catch(e){
      try { return new URL(path, window.location.href).toString(); }
      catch(_) { return path; }
    }
  };


  // Defaults: Nigerian recipes
  w.App.Defaults = {
    recipes: [
      {
        id: 'r-jollof',
        title: 'Smoky Jollof Rice',
        image: 'https://www.deliciousmagazine.co.uk/wp-content/uploads/2022/08/Jolloff_34-960.jpg',
        time: 60,
        servings: 6,
        tags: ['stew','spicy','party'],
        ingredients: [
          {name:'Long-grain rice', qty:3, unit:'cups', category:'pantry'},
          {name:'Tomato puree', qty:2, unit:'cups', category:'pantry'},
          {name:'Scotch bonnet', qty:2, unit:'pcs', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Chicken stock', qty:3, unit:'cups', category:'pantry'},
          {name:'Curry powder', qty:1, unit:'tsp', category:'spices'},
          {name:'Thyme', qty:1, unit:'tsp', category:'spices'},
          {name:'Bay leaf', qty:2, unit:'pcs', category:'spices'},
          {name:'Vegetable oil', qty:4, unit:'tbsp', category:'pantry'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps: [
          'Blend peppers, bonnet, tomato and onion.',
          'Heat oil, fry blend until reduced and aromatic.',
          'Stir in spices and stock, adjust salt.',
          'Add rinsed rice, bay leaves, cover to steam on low until tender.',
          'Let rest, fluff, and serve.'
        ]
      },
      {
        id: 'r-egusi',
        title: 'Egusi Soup',
        image: 'https://lowcarbafrica.com/wp-content/uploads/2018/06/Egusi-Soup-IG-1.jpg',
        time: 55,
        servings: 5,
        tags: ['soup','spicy'],
        ingredients: [
          {name:'Palm oil', qty:3, unit:'tbsp', category:'pantry'},
          {name:'Assorted meat', qty:600, unit:'g', category:'protein'},
          {name:'Stock', qty:3, unit:'cups', category:'pantry'},
          {name:'Ugu/spinach', qty:3, unit:'cups', category:'produce'},
          {name:'Crayfish (ground)', qty:2, unit:'tbsp', category:'spices'},
          {name:'Scotch bonnet', qty:1, unit:'pc', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps:[
          'Blend egusi with a little water into a paste.',
          'Heat palm oil, saute onion and pepper.',
          'Scoop in egusi paste and fry; add stock and meats.',
          'Season with crayfish and salt; simmer.',
          'Stir in greens to wilt and serve.'
        ]
      },
      {
        id: 'r-suya',
        title: 'Beef Suya',
        image: 'https://www.seriouseats.com/thmb/wYBn7S8aLMT9nwJmVcCSpSu8Ds8=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2020__10__20201015-Suya-sho-spaeth-1-78c58be723c944068b3f85c8ff4f9d23.jpg',
        time: 35,
        servings: 4,
        tags: ['street','spicy','quick'],
        ingredients:[
          {name:'Beef (thinly sliced)', qty:600, unit:'g', category:'protein'},
          {name:'Suya spice (yaji)', qty:4, unit:'tbsp', category:'spices'},
          {name:'Groundnut oil', qty:2, unit:'tbsp', category:'pantry'},
          {name:'Salt', qty:0.5, unit:'tsp', category:'spices'}
        ],
        steps:[
          'Toss beef with oil, yaji, and salt.',
          'Skewer and grill until char-kissed.',
          'Serve with onions, tomatoes, and cucumber.'
        ]
      },
      { id:'r-puffpuff',
        title:'Puff Puff',
        image:'https://allnigerianfoods.com/wp-content/uploads/puff_puff_recipe-500x500.jpg',
        time:90, servings:8, tags:['street','snack'],
        ingredients:[
          {name:'Flour', qty:3, unit:'cups', category:'pantry'},
          {name:'Sugar', qty:0.5, unit:'cup', category:'pantry'},
          {name:'Yeast', qty:2, unit:'tsp', category:'pantry'},
          {name:'Warm water', qty:1.5, unit:'cups', category:'pantry'},
          {name:'Oil for frying', qty:null, unit:'enough', category:'pantry'}
        ],
        steps:[
          'Combine dry ingredients and gradually add water.',
          'Let batter rise until doubled.',
          'Fry scoops until golden and drain.'
        ]
      },
      { id:'r-moimoi',
        title:'Moi Moi',
        image: 'https://www.mydiasporakitchen.com/wp-content/uploads/2019/06/savingpng-19.png',
        time:70, servings:6, tags:['steamed','protein'],
        ingredients:[
          {name:'Black-eyed peas', qty:2, unit:'cups', category:'pantry'},
          {name:'Red bell pepper', qty:1, unit:'pc', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Palm oil', qty:2, unit:'tbsp', category:'pantry'},
          {name:'Stock', qty:1, unit:'cup', category:'pantry'}
        ],
        steps:[
          'Soak and peel beans; blend with pepper and onion.',
          'Mix in oil, season, thin with stock.',
          'Steam in bowls or leaves until set.'
        ]
      },
      {
        id:'r-efo',
        title:'Efo Riro',
        image: 'https://i.ytimg.com/vi/lxCY5fObe30/maxresdefault.jpg',
        time:50, servings:5, tags:['soup','spicy'],
        ingredients:[
          {name:'Spinach/Ugu', qty:6, unit:'cups', category:'produce'},
          {name:'Palm oil', qty:3, unit:'tbsp', category:'pantry'},
          {name:'Tomatoes', qty:2, unit:'pcs', category:'produce'},
          {name:'Scotch bonnet', qty:1, unit:'pc', category:'produce'},
          {name:'Assorted meat or fish', qty:500, unit:'g', category:'protein'}
        ],
        steps:[
          'Blend tomatoes and bonnet; simmer with palm oil.',
          'Add meats or fish; season and cook.',
          'Fold in greens to wilt and serve.'
        ]
      }
    ]
  };
})(window);