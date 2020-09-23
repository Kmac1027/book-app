$(document).ready(function() {
    console.log('JavaScript is up and running!');
  });
  
  $('#callForm').on('click', showTemplate);
  
  function showTemplate() {
    console.log('JavaScript is up and running!');
    $('#edit').show();
  }