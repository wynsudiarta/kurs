moment.locale('id');
var Comment = React.createClass({

    render: function() {
        const {...props} = this.props;


        return (
            <tr>
                <td>{props.item.gsx$currency.$t}</td>
                <td>{numeral(props.item.gsx$beli.$t).format('0,0')}</td>
                <td>{numeral(props.item.gsx$jual.$t).format('0,0')}</td>
            </tr>
        );
    }
});

var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        var url = 'https://spreadsheets.google.com/feeds/list/1-NcBjMa6QOFHxMEpgtawvOlP8EQiPnCBsGaBU95mOSA/od6/public/values?alt=json&amp;callback=displayContent';
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({
                    data: data['feed']['entry'],
                    update: moment().format('LLLL'),
                    loading:false,
                    kurs: 'USD'
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {
            data: [],
            update:'',
            loading: true,
            kurs: '',
            amount:0,
            reverse: false
        };
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },

    //  componentDidUpdate: function() {
    //   this.render();
    // },

    getHarga: function(kurs){
        const { data } = this.state;
        const price = data.filter(function(row){
            return row.gsx$currency.$t ===kurs;
        })

        return price[0].gsx$beli.$t;
    },

    reloadData: function() {
        this.setState({loading:true});
        this.loadCommentsFromServer();
    },
    render: function() {
        var options = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };

        const { loading, update, data, kurs, amount, reverse } = this.state;
        let btnClass = loading ? 'button special' : 'button';
        let total =0;
        if (!loading){
            total = reverse ? amount * this.getHarga(kurs) : amount/this.getHarga(kurs);
        }
        return (

            <div id="main">
                <div className="inner">
                    <header>
                        <h1>Kurs Kalkulator</h1>
                        <p>Update : {update.toString()}</p>
                    </header>
                    <h3>Daftar Kurs <a href="#" onClick={this.reloadData} className={btnClass} style={{float:'right'}}>Reload</a></h3>
                    {loading ? <h3 style={{textAlign:'center'}}>Loading . . . .</h3> :
                        <div>
                            <CommentList data={data} />
                        </div>
                    }
                    <Calculator
                        total={total}
                        kurs={kurs}
                        amount={amount}
                        onChangeKurs={(e)=> this.setState({kurs:e})}
                        changeAmount={(e)=> this.setState({amount:e})}
                        reverse={reverse}
                        reverseHandle={(e)=> this.setState({reverse: !reverse})}

                    />
                </div>
            </div>
        );
    }
});
// <section>
//                   <b>Hubungi Kami</b>
//                   <p>Jln. Werkudara 1, No 10 <br />
//                   Br. Karangjung, Sembung, Mengwi, Badung <br />
//                   Phone: <strong>082 144 647 512</strong></p>
//                 </section>


var Calculator = React.createClass({


    handleInputChange(value) {
        this.props.onChangeKurs(value)
    },
    handleChange(event){
        const target = event.target;
        this.props.changeAmount(target.value)
    },


    render: function() {

        return (
            <section>
                <h2>Kalkulator</h2>
                <form method="post" action="#">
                    <div className="row gtr-uniform">
                        <div className="col-3 col-12-small">
                            <input type="radio" id="demo-priority-low" checked={this.props.kurs=== 'AUD'}  name="demo-priority"  />
                            <label onClick={()=>{this.handleInputChange('AUD')}}>AUD</label>
                        </div>
                        <div className="col-3 col-12-small">
                            <input type="radio" id="demo-priority-normal" name="demo-priority"  checked={this.props.kurs=== 'USD'}  />
                            <label onClick={()=>{this.handleInputChange('USD')}}>USD</label>
                        </div>
                    </div>
                    <br/>
                    <div className="row gtr-uniform">
                        <div className="col-6 col-12-xsmall">
                            <input type="text" name="demo-name" id="demo-name" placeholder="Jumlah" onChange={this.handleChange}  />
                        </div>
                        <div className="col-6 col-12-small">
                            <input type="checkbox" id="demo-human" name="demo-human" checked={this.props.reverse}/>
                            <label onClick={()=>{this.props.reverseHandle();}}>Reverse Currency from DOLLAR to RUPIAH</label>
                        </div>

                    </div>
                    <br/>
                    <br/>

                    { this.props.reverse ? (

                        <div className="row gtr-uniform">
                            <div className="col-6 col-12-xsmall">
                                <a href="#" className="button fit">${numeral(this.props.amount).format('0,0.00')}</a>
                            </div>
                            <div className="col-6 col-12-xsmall">
                                <a href="#" className="button fit">{numeral(this.props.total).format('0,0')}</a>
                            </div>
                        </div>
                    ) : (
                        <div className="row gtr-uniform">
                            <div className="col-6 col-12-xsmall">
                                <a href="#" className="button fit">Rp.{numeral(this.props.amount).format('0,0')}</a>
                            </div>
                            <div className="col-6 col-12-xsmall">
                                <a href="#" className="button fit">{numeral(this.props.total).format('$0,0.00')}</a>
                            </div>
                        </div>
                    )}
                </form>
            </section>
        )
    }
})
var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment, k) {
            return (
                <Comment key={k} item={comment} />
            );
        });
        return (
            <section>
                <div className="table-wrapper">
                    <table className="alt">
                        <thead>
                        <tr>
                            <th>Currency</th>
                            <th>Buy</th>
                            <th>Sell</th>
                        </tr>
                        </thead>
                        <tbody>
                        {commentNodes}
                        </tbody>

                    </table>
                </div>
            </section>
        );
    }
});



ReactDOM.render(
    <CommentBox pollInterval={36000} />,
    document.getElementById('wrapper')
);