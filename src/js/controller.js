import {MODAL_CLOSE_SEC} from './config.js'
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {async} from 'regenerator-runtime'; 
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

// if (module.hot) {
//   module.hot.accept();
// }


const controlRecipes = async function() {
  try {
  
    const id = window.location.hash.slice(1);
    // const id = window.location.pathname.slice(1);
    if(!id) return;
    recipeView.renderSpinner();

    //Update results view to mark selected search result
    resultsView.update(model.getSearchResultPage());
    
    //1. Loading recipe
    await model.loadRecipe(id); 
    
    //2. Rendering recipe
    recipeView.render(model.state.recipe);
    
    //Udating bookmarks
    
    bookmarksView.update(model.state.bookmarks);
 } catch(err) {
   recipeView.renderError();
   console.log(err);
 }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQuery();
    
    if (!query) return;
   
    //load search result
    await model.loadSearchResults(query);

    //render result
    resultsView.render(model.getSearchResultPage());

    //4. Render initial pagination buttons
    paginationView.render(model.state.search);
  }catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {

  //render NEW results
  resultsView.render(model.getSearchResultPage(goToPage));

  //4. Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  //Add remove bookmark
  if(!model.state.recipe.bookmarked){
    model.addBookmark(model.state.recipe);
  } else {
     model.deleteBookmark(model.state.recipe.id);
  }

  //Update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks)
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change Id in URl
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    

    //Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);

  }catch(err){
    console.error('****', err);
    addRecipeView.renderError(err.message)
  };

};



const init = function() {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  bookmarksView.addHandlerRender(controlBookmarks);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome');
};
init();
