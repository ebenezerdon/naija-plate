(function(w,$){
  'use strict';
  w.App = w.App || {};

  var KEYS = {
    RECIPES: 'naijaplate.recipes',
    FAVORITES: 'naijaplate.favorites',
    SHOPPING: 'naijaplate.shopping'
  };

  var state = {
    page: 'recipes',
    recipes: [],
    favorites: {},
    shopping: {
      items: [] // {id, name, qty, unit, category, purchased}
    },
    filters: { q: '', tags: [] }
  };

  function loadState(){
    var savedRecipes = w.App.Store.get(KEYS.RECIPES, null);
    var defaults = (w.App.Defaults && w.App.Defaults.recipes) ? w.App.Defaults.recipes : [];
    state.recipes = Array.isArray(savedRecipes) && savedRecipes.length ? savedRecipes : defaults;
    if(!Array.isArray(savedRecipes) || !savedRecipes.length){
      // save defaults so user can edit
      w.App.Store.set(KEYS.RECIPES, state.recipes);
    }
    state.favorites = w.App.Store.get(KEYS.FAVORITES, {} ) || {};
    var savedShop = w.App.Store.get(KEYS.SHOPPING, { items: [] });
    state.shopping = savedShop && savedShop.items ? savedShop : { items: [] };
    migrateRecipeImages();

    migrateRecipeContent();
  }

  function saveRecipes(){ w.App.Store.set(KEYS.RECIPES, state.recipes); }
  function saveFavorites(){ w.App.Store.set(KEYS.FAVORITES, state.favorites); }
  function saveShopping(){ w.App.Store.set(KEYS.SHOPPING, state.shopping); }

  function migrateRecipeImages(){
    var replacements = {
      'r-jollof': 'https://www.deliciousmagazine.co.uk/wp-content/uploads/2022/08/Jolloff_34-960.jpg',
      'r-egusi': 'https://lowcarbafrica.com/wp-content/uploads/2018/06/Egusi-Soup-IG-1.jpg',
      'r-suya': 'https://www.seriouseats.com/thmb/wYBn7S8aLMT9nwJmVcCSpSu8Ds8=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__2020__10__20201015-Suya-sho-spaeth-1-78c58be723c944068b3f85c8ff4f9d23.jpg',
      'r-moimoi': 'https://www.mydiasporakitchen.com/wp-content/uploads/2019/06/savingpng-19.png',
      'r-efo': 'https://i.ytimg.com/vi/lxCY5fObe30/maxresdefault.jpg',
      'r-puffpuff': 'https://allnigerianfoods.com/wp-content/uploads/puff_puff_recipe-500x500.jpg'
    };
    var changed = false;
    state.recipes = (state.recipes||[]).map(function(r){
      if(replacements[r.id]){
        if(r.image !== replacements[r.id]){
          r = Object.assign({}, r, { image: replacements[r.id] });
          changed = true;
        }
      }
      return r;
    });
    if(changed){ saveRecipes(); }

  }

  function migrateRecipeContent(){
    var defaults = (w.App.Defaults && w.App.Defaults.recipes) ? w.App.Defaults.recipes : [];
    var map = {};
    defaults.forEach(function(r){ map[r.id] = r; });
    var changed = false;
    state.recipes = (state.recipes||[]).map(function(r){
      var c = map[r.id];
      if(c){
        var ingEqual = JSON.stringify(r.ingredients||[]) === JSON.stringify(c.ingredients||[]);
        var stepsEqual = JSON.stringify(r.steps||[]) === JSON.stringify(c.steps||[]);
        if(!ingEqual || !stepsEqual){
          r = Object.assign({}, r, {
            ingredients: c.ingredients,
            steps: c.steps,
            time: c.time || r.time,
            servings: c.servings || r.servings
          });
          changed = true;
        }
      }
      return r;
    });
    if(changed){ saveRecipes(); }
  }

  function currentPage(){
    var attr = document.documentElement.getAttribute('data-page') || document.body.getAttribute('data-page');
    return attr || 'recipes';
  }

  // Rendering helpers
  function renderRecipesPage(){
    renderRecipeGrid();
    bindRecipeEvents();
  }

  function renderShoppingPage(){
    renderShoppingList();
    bindShoppingEvents();
  }

  function filterRecipes(){
    var q = (state.filters.q || '').toLowerCase().trim();
    var tags = state.filters.tags;
    return state.recipes.filter(function(r){
      var matchesText = !q || r.title.toLowerCase().includes(q) || (r.tags||[]).join(' ').toLowerCase().includes(q) || (r.ingredients||[]).some(function(i){ return (i.name||'').toLowerCase().includes(q); });
      var matchesTags = !tags.length || tags.every(function(t){ return (r.tags||[]).indexOf(t) >= 0; });
      return matchesText && matchesTags;
    });
  }

  function recipeCard(r){
    var fav = !!state.favorites[r.id];
    var tagsHtml = (r.tags||[]).map(function(t){ return '<span class="tag">'+t+'</span>'; }).join(' ');
    return `
      <article class="card overflow-hidden hover-lift" data-id="${r.id}">
        <div class="relative">
          <img alt="${r.title}" src="${r.image}" class="w-full h-44 object-cover" onerror="this.onerror=null;this.src='assets/images/placeholder.svg';"/>
          <button class="absolute top-3 right-3 btn-secondary text-xs px-3 py-1" data-action="favorite" aria-pressed="${fav}">${fav ? '★ Saved' : '☆ Save'}</button>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg" style="font-family:'Work Sans', sans-serif;">${r.title}</h3>
          <div class="mt-1 text-sm text-[#2E3B36] flex items-center gap-3">
            <span class="badge"><span class="badge-dot"></span> ${r.time} mins</span>
            <span class="badge">Serves ${r.servings}</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">${tagsHtml}</div>
          <div class="mt-4 flex items-center gap-2">
            <button class="btn-primary" data-action="open">View</button>
            <button class="btn-secondary" data-action="add-all">Add ingredients</button>
          </div>
        </div>
      </article>`;
  }

  function renderRecipeGrid(){
    var list = filterRecipes();
    var $grid = $('#recipesGrid');
    $grid.empty();
    if(!list.length){
      $grid.append(`<div class="col-span-full text-center p-10 card">No recipes found. Try another search or add your own.</div>`);
      return;
    }
    list.forEach(function(r){ $grid.append($(recipeCard(r))); });
  }

  function openRecipeModal(id){
    var r = state.recipes.find(function(x){ return x.id===id; });
    if(!r) return;
    $('#recipeTitle').text(r.title);
    $('#recipeMeta').text(r.time+ ' mins • Serves ' + r.servings);
    $('#recipeImage').attr('src', r.image).attr('alt', r.title);
    var tags = (r.tags||[]).map(function(t){ return `<span class="tag">${t}<\/span>`; }).join(' ');
    $('#recipeTags').html(tags);
    var ing = (r.ingredients||[]).map(function(i){
      var qty = (i.qty==null || i.qty==='') ? '' : i.qty;
      var unit = i.unit ? ' ' + i.unit : '';
      return `<li class="flex items-center gap-2"><span class="badge-dot"></span><span>${i.name}${qty?': ':''}${qty}${unit}<\/span><\/li>`;
    }).join('');
    $('#recipeIngredients').html(ing);
    var steps = (r.steps||[]).map(function(s){ return `<li>${s}<\/li>`; }).join('');
    $('#recipeSteps').html(steps);

    $('#addAllToList').attr('data-id', r.id);

    $('#recipeModalBackdrop, #recipeModal').removeClass('hidden');
  }

  function closeRecipeModal(){ $('#recipeModalBackdrop, #recipeModal').addClass('hidden'); }

  function bindRecipeEvents(){
    // Search
    $('#searchInput').on('input', w.App.Utils.debounce(function(){
      state.filters.q = $(this).val();
      renderRecipeGrid();
    }, 200));

    // Tags
    $('.chip[data-tag]').on('click', function(){
      var t = $(this).data('tag');
      var idx = state.filters.tags.indexOf(t);
      if(idx>=0){ state.filters.tags.splice(idx,1); $(this).removeClass('ring-[#0B7A3B]'); }
      else { state.filters.tags.push(t); $(this).addClass('ring-[#0B7A3B]'); }
      renderRecipeGrid();
    });

    // Card actions (delegated)
    $('#recipesGrid').on('click', '[data-action="open"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      openRecipeModal(id);
    });

    $('#recipesGrid').on('click', '[data-action="add-all"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      addIngredientsToList(id);
      $(this).text('Added ✓');
      setTimeout(()=>$(this).text('Add ingredients'), 1200);
    });

    $('#recipesGrid').on('click', '[data-action="favorite"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      toggleFavorite(id);
      renderRecipeGrid();
    });

    // Modal actions
    $('#closeRecipe').on('click', closeRecipeModal);
    $('#recipeModalBackdrop').on('click', closeRecipeModal);
    $('#addAllToList').on('click', function(){ var id=$(this).attr('data-id'); addIngredientsToList(id); $('#closeRecipe').trigger('click'); });

    // New recipe modal
    $('#openNewRecipe, #openNewRecipeSm').on('click', function(){ $('#newRecipeBackdrop, #newRecipeModal').removeClass('hidden'); });
    function closeNewRecipe(){ $('#newRecipeBackdrop, #newRecipeModal').addClass('hidden'); }
    $('#closeNewRecipe, #cancelNewRecipe, #newRecipeBackdrop').on('click', closeNewRecipe);

    $('#newRecipeForm').on('submit', function(e){ e.preventDefault();
      try{ createRecipeFromForm(this); $('#newRecipeForm')[0].reset(); closeNewRecipe(); renderRecipeGrid(); }
      catch(err){ console.error('Create recipe failed', err); alert('Could not save recipe. Please check your inputs.'); }
    });
  }

  function toggleFavorite(id){
    if(state.favorites[id]) delete state.favorites[id]; else state.favorites[id]=true; saveFavorites();
  }

  function createRecipeFromForm(form){
    var fd = $(form).serializeArray().reduce(function(acc, cur){ acc[cur.name]=cur.value; return acc; }, {});
    var recipe = {
      id: w.App.Utils.uuid(),
      title: (fd.title||'').trim(),
      image: (fd.image||'').trim() || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop',
      time: parseInt(fd.time||'0',10) || 30,
      servings: parseInt(fd.servings||'0',10) || 4,
      tags: (fd.tags||'').split(',').map(function(t){return t.trim().toLowerCase();}).filter(Boolean),
      ingredients: [],
      steps: []
    };

    // ingredients: name | qty | unit | category
    (fd.ingredients||'').split(/\n+/).forEach(function(line){
      var parts = line.split('|').map(function(s){return s.trim();});
      if(!parts[0]) return;
      recipe.ingredients.push({
        name: parts[0],
        qty: parts[1] ? parseFloat(parts[1]) : null,
        unit: parts[2] || '',
        category: (parts[3]||'other').toLowerCase()
      });
    });

    recipe.steps = (fd.steps||'').split(/\n+/).map(function(s){return s.trim();}).filter(Boolean);

    if(!recipe.title){ throw new Error('Title required'); }

    state.recipes.unshift(recipe);
    saveRecipes();
  }

  function addIngredientsToList(recipeId){
    var recipe = state.recipes.find(function(r){return r.id===recipeId;});
    if(!recipe) return;
    recipe.ingredients.forEach(function(i){
      state.shopping.items.push({id: w.App.Utils.uuid(), name:i.name, qty:i.qty, unit:i.unit, category:i.category||'other', purchased:false});
    });
    saveShopping();
  }

  // Shopping page
  function renderShoppingList(){
    var items = state.shopping.items.slice();
    // Group by category
    var grouped = w.App.Utils.groupBy(items, function(it){ return (it.category||'other'); });
    var order = ['produce','protein','pantry','spices','bakery','frozen','other'];
    var $wrap = $('#listContainer');
    $wrap.empty();

    order.forEach(function(cat){
      var list = grouped[cat] || [];
      var title = cat.charAt(0).toUpperCase()+cat.slice(1);
      var count = list.length;
      var $sec = $(`
        <div class="border border-black/5 rounded-2xl overflow-hidden">
          <header class="flex items-center justify-between px-4 py-3 bg-white">
            <h3 class="font-bold" style="font-family:'Work Sans', sans-serif;">${title} <span class="text-[#2E3B36] text-sm">(${count})<\/span><\/h3>
            <button class="btn-secondary" data-action="collapse">Toggle</button>
          <\/header>
          <ul class="divide-y divide-black/5 bg-white" data-cat="${cat}"></ul>
        <\/div>`);

      var $ul = $sec.find('ul');
      list.forEach(function(it){ $ul.append(itemRow(it)); });
      $wrap.append($sec);
    });

    if(!items.length){ $wrap.append('<div class="card p-8 text-center">Your list is empty. Add items or push ingredients from a recipe.<\/div>'); }
  }

  function itemRow(it){
    var qty = (it.qty==null || it.qty==='') ? '' : it.qty;
    var unit = it.unit ? ' ' + it.unit : '';
    var checked = it.purchased ? 'checked' : '';
    return $(`
      <li class="list-item" data-id="${it.id}">
        <label class="flex items-center gap-3 flex-1">
          <input type="checkbox" ${checked} data-action="toggle" class="h-5 w-5"/>
          <div class="min-w-0">
            <div class="font-semibold ${it.purchased?'line-through opacity-60':''}">${it.name}<\/div>
            <div class="text-xs text-[#2E3B36]">${qty}${unit}${it.category?' • '+it.category:''}<\/div>
          <\/div>
        <\/label>
        <div class="flex items-center gap-2">
          <button class="btn-secondary text-xs" data-action="edit">Edit<\/button>
          <button class="btn-secondary text-xs" data-action="delete">Remove<\/button>
        <\/div>
      <\/li>`);
  }

  function bindShoppingEvents(){
    // Toggle collapse
    $('#listContainer').on('click', '[data-action="collapse"]', function(){
      var $ul = $(this).closest('div').find('ul');
      $ul.slideToggle(180);
    });

    // Toggle purchased
    $('#listContainer').on('change', 'input[type=checkbox][data-action="toggle"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      var it = state.shopping.items.find(function(x){return x.id===id;});
      if(it){ it.purchased = !!this.checked; saveShopping(); renderShoppingList(); }
    });

    // Delete
    $('#listContainer').on('click', '[data-action="delete"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      state.shopping.items = state.shopping.items.filter(function(x){ return x.id!==id; });
      saveShopping(); renderShoppingList();
    });

    // Edit
    $('#listContainer').on('click', '[data-action="edit"]', function(){
      var id = $(this).closest('[data-id]').data('id');
      var it = state.shopping.items.find(function(x){return x.id===id;});
      if(!it) return;
      var name = prompt('Name', it.name); if(name===null) return;
      var qty = prompt('Quantity', it.qty==null?'':it.qty); if(qty===null) return;
      var unit= prompt('Unit', it.unit||''); if(unit===null) return;
      var cat = prompt('Category', it.category||'other'); if(cat===null) return;
      it.name = name.trim()||it.name; it.qty = qty===''?null:parseFloat(qty); it.unit=unit.trim(); it.category=cat.trim().toLowerCase();
      saveShopping(); renderShoppingList();
    });

    // Form add item
    $('#addItemForm').on('submit', function(e){ e.preventDefault();
      var data = $(this).serializeArray().reduce(function(acc, cur){ acc[cur.name]=cur.value; return acc; }, {});
      var item = { id: w.App.Utils.uuid(), name: (data.name||'').trim(), qty: data.qty ? parseFloat(data.qty) : null, unit: (data.unit||'').trim(), category: (data.category||'other').toLowerCase(), purchased:false };
      if(!item.name){ alert('Item name is required'); return; }
      state.shopping.items.push(item); saveShopping(); this.reset(); renderShoppingList();
    });

    // Merge duplicates
    $('#mergeDuplicates').on('click', function(){
      var map = {};
      state.shopping.items.forEach(function(it){
        var key = (it.name||'').toLowerCase() + '|' + (it.unit||'');
        if(!map[key]) map[key] = Object.assign({}, it);
        else {
          var total = (map[key].qty||0) + (it.qty||0);
          map[key].qty = total || null;
          map[key].purchased = map[key].purchased && it.purchased; // only true if both purchased
        }
      });
      state.shopping.items = Object.keys(map).map(function(k){ return map[k]; });
      saveShopping(); renderShoppingList();
    });

    // Clear purchased
    $('#clearPurchased').on('click', function(){
      state.shopping.items = state.shopping.items.filter(function(it){ return !it.purchased; });
      saveShopping(); renderShoppingList();
    });

    // Export
    $('#exportList').on('click', function(){
      var text = state.shopping.items.map(function(it){ var qty = it.qty==null?'':it.qty; var unit = it.unit?(' '+it.unit):''; return '- ' + it.name + (qty||unit?(': '+qty+unit):''); }).join('\n');
      w.App.Utils.toClipboard(text).then(function(){ alert('Shopping list copied to clipboard'); });
    });

    // Print
    $('#printList').on('click', function(){ window.print(); });

    // Clear all
    $('#clearAll').on('click', function(){ if(confirm('Clear the entire shopping list?')){ state.shopping.items = []; saveShopping(); renderShoppingList(); } });
  }

  // Public API
  w.App.init = function(){
    state.page = currentPage();
    loadState();
  };

  w.App.render = function(){
    if(state.page === 'shopping'){ renderShoppingPage(); }
    else { renderRecipesPage(); }
  };

})(window, jQuery);