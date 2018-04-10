document.getElementById('file').addEventListener("change", function(event) {
    if ((this.files[0].size / 1000000) > 5) {
      const html = `
        <div class="row">
          <div class="col-6">
            <div class="alert alert-dismissible alert-danger">
              <button class="close" type="button" data-dismiss="alert">×</button>
              <strong>Error: </strong>Maximum file size is 5 MB
            </div>
          </div>
        </div>`;
      event.target
        .parentElement // get <form> element
        .parentElement // get .col
        .parentElement // get .row
        .insertAdjacentHTML('beforeBegin', html);
      event.target.parentElement.reset();
    }
});
