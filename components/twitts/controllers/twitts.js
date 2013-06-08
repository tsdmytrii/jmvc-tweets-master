steal('jquery',
    'jquery/controller', // a widget factory
    'jquery/controller/subscribe', // subscribe to OpenAjax.hub
    'jquery/view',
    'jquery/controller/view', // lookup views with the controller's name
    'jquery/model', // Ajax wrappers   ,
    'jquery/view/tmpl',
    'components/bootstrap',
        
    {
        'src':'jquery/dom/fixture', 
        'ignore':true
    })

.then  (function($){
  
    $(document).ready(function () {
  
        $.fixture.make(["get_tweets", "message"], 5, function (i) {
            return {
                id:i,
                date: "date" + i,
                description:"tweet " + i
            }
        });
        
        //    var searchValue =  ;
        $.fixture.make(["search_tweets", "message"], 4, function (i) {
            console.log($("#searchInput").val())
            return {
                id:i,
                date: "date" + i,
                description: function(){
                    return $("#searchInput").val()+ " " + i
                }  
            }
        });
        $.fixture.make(["delete_tweet", "message"], 1, function (i) {
            return true;
        });

    

        $.Controller('Tweets', {
            'viewpath':'//components/twitts/views/'
        }, {
            'init':function () {
                this.loadingTweets();
            },
            'loadingTweets':function () {
                var that = this;
                TweetsModel.getTweets(function (data) {
                    that.renderTweets(data);
                });
            },
            'searchTweets': function()  {
                var that= this;
                TweetsModel.searchTweets( function (data) {
                    that.renderTweets(data);  
                })
            }
            ,
            'renderTweets': function (data) {
                var that = this;
                $('#container').fadeOut(function () {
                    $(this).html($.View(that.Class.viewpath + 'tweets.tmpl', {
                        tweets:data.data
                    }
                    )).fadeIn()
                ;
                });
            },
        
            'cleaningTweets': function () {
                var that = this;
                $('#container').empty();
            },
                    
            '.reload click': function() {
                this.loadingTweets();                                          
                        
            },
            '.closeButton click': function() {
                this.cleaningTweets();
            },
            '.searchBtn click': function(event) {
                this.searchTweets();
            },
            '.delete click':function (el, ev) {
                var tweetsId = el.data('tweets-id');
                var that = this;
                if (confirm('Are you sure to delete tweets #' + tweetsId)) {
                    TweetsModel.deleteTweet(tweetsId, function () {
                        that.publish('Tweets.deleted', {
                            id:tweetsId
                        });
                    })
                }
            },
            'Tweets.deleted subscribe':function (called, data) {
                this.deleteTweetsFromDom(data.id)
            },
            'deleteTweetsFromDom':function (id) {
                $('button[data-tweets-id=' + id + ']').parents('tr').remove();

            }
        });
                    
        $.Model('TweetsModel', {
          
            'getTweets':function (cb) {
                $.ajax({
                    url:'get_tweets',
                    dataType:'json',
                    'type':'post',
                    'fixture':'-get_tweets',
                    success:this.callback(cb)
                });
            },
            'searchTweets':function (cb) {
             
                $.ajax({
                    url:'search_tweets',
                    dataType:'json',
                    'type':'post',
                    'fixture':'-search_tweets',
                    success:this.callback(cb)
                });
            },
            'deleteTweet':function (id, cb) {
                $.ajax({
                    url:'delete_tweet',
                    dataType:'json',
                    'type':'post',
                    'fixture':'-delete_tweet',
                    success:this.callback(cb)
                });
            }
        }, 
        {
        });
  
        $('body').tweets();
    })
})


   