
var date = new Date();
module.exports.getDate = () => {



    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"



    };

    return date.toLocaleDateString("en", options);



}

module.exports.getDay = () => {


    var options = {
        weekday: "long",




    };
    return date.toLocaleDateString("en", options);;
}
