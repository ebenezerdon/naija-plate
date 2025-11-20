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
          {name:'Long-grain parboiled rice', qty:3, unit:'cups', category:'pantry'},
          {name:'Red bell pepper', qty:2, unit:'pcs', category:'produce'},
          {name:'Plum tomatoes', qty:4, unit:'pcs', category:'produce'},
          {name:'Scotch bonnet', qty:2, unit:'pcs', category:'produce'},
          {name:'Onion', qty:2, unit:'pcs', category:'produce'},
          {name:'Tomato paste', qty:3, unit:'tbsp', category:'pantry'},
          {name:'Chicken stock', qty:3.5, unit:'cups', category:'pantry'},
          {name:'Vegetable oil', qty:6, unit:'tbsp', category:'pantry'},
          {name:'Curry powder', qty:1, unit:'tsp', category:'spices'},
          {name:'Thyme', qty:1, unit:'tsp', category:'spices'},
          {name:'Bay leaf', qty:2, unit:'pcs', category:'spices'},
          {name:'Garlic', qty:2, unit:'cloves', category:'produce'},
          {name:'Ginger (grated)', qty:1, unit:'tsp', category:'spices'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps: [
          'Rinse rice under cold water until the water runs clear; drain well.',
          'Blend red peppers, tomatoes, 1 onion, and scotch bonnet into a smooth puree.',
          'Heat oil in a heavy pot. Fry tomato paste for 2 minutes, then add the pepper puree and cook on medium, stirring, until reduced and sweet, 10–15 minutes.',
          'Stir in curry, thyme, bay leaves, and chicken stock. Taste and season with salt.',
          'Add the rinsed rice and the remaining onion (sliced). Stir once to combine, then cover tightly with a lid (use foil under the lid for a tight seal).',
          'Cook on low heat for 25–30 minutes until rice is almost tender; avoid stirring.',
          'If dry, add a splash of stock, cover, and steam 8–10 minutes more until grains are soft and lightly smoky at the bottom.',
          'Turn off heat, fluff gently, rest 5 minutes, and serve.'
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
          {name:'Ground egusi (melon) seeds', qty:2, unit:'cups', category:'pantry'},
          {name:'Palm oil', qty:4, unit:'tbsp', category:'pantry'},
          {name:'Assorted meat', qty:600, unit:'g', category:'protein'},
          {name:'Stock', qty:3, unit:'cups', category:'pantry'},
          {name:'Ugu/spinach', qty:3, unit:'cups', category:'produce'},
          {name:'Crayfish (ground)', qty:2, unit:'tbsp', category:'spices'},
          {name:'Scotch bonnet', qty:1, unit:'pc', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Iru (locust beans)', qty:1, unit:'tbsp', category:'spices'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps:[
          'In a bowl, mix ground egusi with about 1/2–3/4 cup water and half the onion (blended or grated) to form a thick paste.',
          'Heat palm oil in a pot. Add remaining chopped onion and iru and fry for 1 minute.',
          'Add spoonfuls of the egusi paste and fry, stirring, until it begins to look grainy and aromatic, 6–8 minutes.',
          'Pour in stock gradually, stirring to loosen the egusi. Simmer for 5 minutes.',
          'Add cooked assorted meat (or fish), crayfish, and blended scotch bonnet. Season with salt.',
          'Simmer 10–12 minutes to thicken and develop flavor.',
          'Stir in chopped ugu or spinach and cook 2–3 minutes until just wilted. Serve hot.'
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
          {name:'Salt', qty:0.5, unit:'tsp', category:'spices'},
          {name:'Wooden skewers', qty:null, unit:'as needed', category:'other'},
          {name:'Onion (for serving)', qty:1, unit:'pc', category:'produce'},
          {name:'Tomato (for serving)', qty:1, unit:'pc', category:'produce'},
          {name:'Cucumber (for serving)', qty:0.5, unit:'pc', category:'produce'}
        ],
        steps:[
          'Soak wooden skewers in water for 20 minutes.',
          'Slice beef across the grain into thin strips if needed.',
          'Toss beef with groundnut oil, 3 tbsp yaji, and salt. Marinate 30 minutes.',
          'Thread beef onto skewers.',
          'Grill over high heat or broil on a rack, 6–8 minutes per side, until cooked through with charred edges.',
          'Brush with a little oil and dust with remaining yaji. Rest 2 minutes.',
          'Serve with sliced onion, tomato, and cucumber.'
        ]
      },
      { id:'r-puffpuff',
        title:'Puff Puff',
        image:'https://allnigerianfoods.com/wp-content/uploads/puff_puff_recipe-500x500.jpg',
        time:90, servings:8, tags:['street','snack'],
        ingredients:[
          {name:'Flour', qty:3, unit:'cups', category:'pantry'},
          {name:'Sugar', qty:0.5, unit:'cup', category:'pantry'},
          {name:'Instant yeast', qty:2, unit:'tsp', category:'pantry'},
          {name:'Warm water', qty:1.5, unit:'cups', category:'pantry'},
          {name:'Salt', qty:0.5, unit:'tsp', category:'spices'},
          {name:'Nutmeg (ground)', qty:0.5, unit:'tsp', category:'spices'},
          {name:'Oil for frying', qty:null, unit:'enough', category:'pantry'}
        ],
        steps:[
          'In a bowl, whisk flour, sugar, salt, nutmeg, and yeast together.',
          'Gradually add warm water and mix to a thick, stretchy batter.',
          'Cover and proof in a warm spot until doubled in size, 45–60 minutes.',
          'Heat oil in a deep pot to 170–180°C.',
          'Scoop batter with hand or spoon and drop into the oil. Fry, turning, until deep golden, 3–4 minutes.',
          'Drain on a rack and serve warm (dust with sugar if you like).'
        ]
      },
      { id:'r-moimoi',
        title:'Moi Moi',
        image: 'https://www.mydiasporakitchen.com/wp-content/uploads/2019/06/savingpng-19.png',
        time:70, servings:6, tags:['steamed','protein'],
        ingredients:[
          {name:'Black-eyed peas', qty:2, unit:'cups', category:'pantry'},
          {name:'Red bell pepper', qty:1, unit:'pc', category:'produce'},
          {name:'Scotch bonnet', qty:1, unit:'pc', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Palm oil', qty:2, unit:'tbsp', category:'pantry'},
          {name:'Stock', qty:1, unit:'cup', category:'pantry'},
          {name:'Eggs (optional)', qty:2, unit:'pcs', category:'protein'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps:[
          'Soak beans for 20–30 minutes, then rub to remove the skins. Rinse off the skins and drain.',
          'Blend peeled beans with bell pepper, scotch bonnet, onion, and stock until very smooth.',
          'Stir in palm oil and salt. The batter should be pourable but not watery; adjust with a little stock if needed.',
          'Grease ramekins or prepare leaves/cups. Fill each about 3/4 full; add slices of egg if using.',
          'Arrange in a steamer or a pot with a rack. Add water to just below the cups, cover tightly.',
          'Steam on medium heat 45–60 minutes until set and a skewer comes out clean. Cool slightly and serve.'
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
          {name:'Red bell pepper', qty:2, unit:'pcs', category:'produce'},
          {name:'Tomatoes', qty:2, unit:'pcs', category:'produce'},
          {name:'Scotch bonnet', qty:1, unit:'pc', category:'produce'},
          {name:'Onion', qty:1, unit:'pc', category:'produce'},
          {name:'Iru (locust beans)', qty:1, unit:'tbsp', category:'spices'},
          {name:'Crayfish (ground)', qty:1, unit:'tbsp', category:'spices'},
          {name:'Assorted meat or fish', qty:500, unit:'g', category:'protein'},
          {name:'Stock', qty:1, unit:'cup', category:'pantry'},
          {name:'Salt', qty:null, unit:'to taste', category:'spices'}
        ],
        steps:[
          'Blend bell peppers, tomatoes, scotch bonnet, and half the onion to a coarse puree.',
          'Heat palm oil and saute the remaining chopped onion with iru for 1–2 minutes.',
          'Add the pepper blend and fry on medium heat until reduced and oil floats, 10–12 minutes.',
          'Add meats or fish and stock; simmer 8–10 minutes. Stir in crayfish and salt to taste.',
          'Add spinach/ugu and cook 2–3 minutes until just wilted. Serve.'
        ]
      }
    ]
  };
})(window);