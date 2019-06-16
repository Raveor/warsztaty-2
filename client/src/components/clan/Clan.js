import React, {Component} from 'react';
import axios from 'axios';
import ClanMemberItem from "./ClanMemberItem";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import AddNewMember from "./AddNewMember";
import ClanBuilding from "./ClanBuilding";

class Clan extends Component {
    constructor(props) {
        super(props);
        this.getMembers = this.getMembers.bind(this);
        this.reload = this.reload.bind(this);
        this.deleteMember = this.deleteMember.bind(this);
        this.setCommander = this.setCommander.bind(this);
        this.leave = this.leave.bind(this);
        this.incrementFunc = this.incrementFunc.bind(this);
        this.incrementMoneyFunc = this.incrementMoneyFunc.bind(this);
        this.state = {
            _id: null,
            isClanExists: true,
            clanName: null,
            loading: true,
            expand: null,
            isMemberOfClan: false,
            members: [],
            buildings: {},
            data: {
                clanName: ""
            },
            errors: {
                clanName: ""
            }
        };

    }

    componentDidMount() {
        const {clanName, clan} = this.props.location.state ? this.props.location.state : "";

        if (clanName && clanName.length > 0) {
            this.setState({
                ...this.state,
                clanName: clanName,
                buildings: clan.buildings,
                money: clan.money,
                isClanExists: true
            });
            this.getMembers(clanName);
        } else {
            axios
                .get("/clan/my")
                .then(response => {
                    let clan = response.data;
                    if (clan) {
                        this.setState({
                            ...this.state,
                            clanName: clan.name,
                            money: clan.money,
                            buildings: clan.buildings,
                            isClanExists: false
                        });
                        this.getMembers(clan.name);
                    } else {
                        this.setState({
                            ...this.state,
                            loading: false
                        })
                    }
                })
                .catch(err => {
                    this.setState({
                        ...this.state,
                        isClanExists: false,
                        loading: false
                    });
                    dispatch({
                        type: GET_ERRORS,
                        payload: err.response
                    })
                });
        }
    }

    reload() {
        this.getMembers(this.state.clanName);
    }

    getMembers = async (clanName) => {
        await axios
            .get("/clan/members", {params: {clanName: clanName}})
            .then(response => {
                let members = response.data;
                let membersIdArray = members.map(member => member.userId._id);

                this.setState({
                    ...this.state,
                    members,
                    isMemberOfClan: membersIdArray.includes(this.props.auth.user.id)
                });
            })
            .catch(err => {
                    this.setState({
                        ...this.state,
                        isClanExisting: false
                    });
                    dispatch({
                        type: GET_ERRORS,
                        payload: err.response
                    })
                }
            );
        await axios
            .get("/clan/commanders", {params: {clanName: clanName}})
            .then(response => {
                let commanders = response.data;
                commanders = commanders.map(commander => commander.userId);
                this.setState({
                    ...this.state,
                    commanders,
                    loading: false
                })
            })
            .catch(err => {
                    dispatch({
                        type: GET_ERRORS,
                        payload: err.response
                    })
                }
            );
    };

    setExpanded = id => {
        this.setState({
            ...this.state,
            expand: id
        });
    };

    deleteMember(username) {
        axios.post("/clan/dismiss", {username: username})
            .then(() => {
                this.getMembers(this.state.clanName);
            })
            .catch(err => {
                    console.log(err);
                }
            )
    }

    validateForm = (errors) => {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    };


    handleChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        if (name === 'clanName') {
            errors.clanName =
                value.length < 2
                    ? "Clan name must be 2 characters long!"
                    : '';
        } else {
        }

        this.setState({
            ...this.state,
            errors,
            ...this.state.data,
            data: {
                [name]: value
            }
        });
    };


    handleSubmit = e => {
        e.preventDefault();
        if (this.validateForm(this.state.errors)) {
            axios
                .post('/clan/create', this.state.data)
                .then(() => {
                    this.setState({
                        ...this.state,
                        clanName: this.state.data.clanName
                    });
                    this.reload();
                })
                .catch(errors => {
                    this.setState({
                            ...this.state,
                            errors
                        }
                    );
                });
        }


    };

    incrementFunc(key, stat, value = 1) {
        let money = this.state.money;
        axios
            .post("/clan/upgrade/" + key)
            .then(response => {
                this.setState(prevState => ({
                    buildings: {
                        ...prevState.buildings,
                        [key]: stat + 1,
                    },
                    money: money - ((value + 1) * 1000)
                }));
            })
            .catch(error => {
                console.log(error);
            });
    }

    incrementMoneyFunc(key, stat, value = 1) {
        let newMoney;
        axios
            .post("/clan/pay", {moneyAmount: value})
            .then(response => {
                newMoney = response.data.money;
                this.setState({
                    ...this.state,
                    money: newMoney
                })
            })
            .catch(error => {
                console.log(error);
            })

    }

    setCommander(username) {
        axios.post("/clan/promote", {username: username})
            .then(() => {
                this.getMembers(this.state.clanName);
            })
            .catch(err => {
                    console.log(err);
                }
            )
    }

    leave() {
        axios.post("/clan/leave")
            .then(() => {
                this.getMembers(this.state.clanName);
            })
            .catch(err => {
                    console.log(err);
                }
            )
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="preloader-wrapper big active loader">
                    <div className="spinner-layer spinner-blue-only">
                        <div className="circle-clipper left">
                            <div className="circle"/>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"/>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"/>
                        </div>
                    </div>
                </div>
            )
        }
        const {errors} = this.state;
        const isUserCommander = this.state.commanders ? this.state.commanders.includes(this.props.auth.user.id) : false;
        const isMemberOfClan = this.state.isMemberOfClan;
        let members =
            this.state.members && this.state.members.length > 0 ? (
                this.state.members.map(member => (
                    <ClanMemberItem
                        key={member._id}
                        member={member}
                        userId={this.props.auth.user.id}
                        isUserCommander={isUserCommander}
                        isMemberCommander={this.state.commanders.includes(member.userId._id)}
                        expanded={member._id === this.state.expand}
                        expandFunc={this.setExpanded}
                        deleteMember={this.deleteMember}
                        setCommander={this.setCommander}
                    />
                ))
            ) : this.state.isClanExists ? (
                <div className="collection-item ">
                    <div className="row">
                <span
                    className="title col s12"
                >
                    <h4>This clan has no members!</h4>
                </span>
                    </div>
                </div>
            ) : (
                <div className="collection-item ">
                    <div className="row">
                <span
                    className="title col s12"
                >
                    <h4>You don't belong to any clan!<br/>
                    Create new one:</h4>
                </span>
                        {/*<div className="col s3 right">*/}
                        <form className="col s12" onSubmit={this.handleSubmit}>
                            <div className="input-field col s6">
                                <input id="clanName" name="clanName" type="text"
                                       className={errors.clanName.length > 0 ? 'invalid' : ''}
                                       onChange={this.handleChange}/>
                                {errors.clanName.length > 0 &&
                                <span className="helper-text" data-error={errors.clanName}/>}
                                <label htmlFor="name">New clan name</label>
                                <div className="row center">
                                    <button
                                        className="center waves-effect waves-light btn-small"
                                        type="submit"
                                    >
                                        Create!<i className="material-icons right">send</i>
                                    </button>
                                </div>
                            </div>
                        </form>
                        {/*</div>*/}
                    </div>
                </div>

            );

        let addNewMember = isUserCommander ? (
            <AddNewMember
                key={1}
                expanded={1 === this.state.expand}
                expandFunc={this.setExpanded}
                reload={this.reload}/>
        ) : "";

        let leave = isMemberOfClan ? (
            <button
                style={{
                    width: "150px",
                    borderRadius: "3px",
                    marginTop: "1rem"
                }}
                onClick={() => this.leave()}
                className="btn btn-large waves-effect waves-light hoverable accent-3 red"
            >
                Leave
            </button>
        ) : "";

        let chat = isMemberOfClan ? (
            <button
                style={{
                    width: "150px",
                    borderRadius: "3px",
                    marginTop: "1rem"
                }}
                onClick={() => this.props.history.push("/clan/chat")}
                className="btn btn-large waves-effect waves-light hoverable accent-3"
            >
                Chat
            </button>
        ) : "";

        let buildings = [];

        Object.entries(this.state.buildings).forEach(([key, val]) => {
            buildings.push(<ClanBuilding
                key={key}
                building={key}
                value={val}
                isMoney={false}
                isMemberCommander={isUserCommander}
                incrementFunc={this.incrementFunc}
                incrementMoneyFunc={this.incrementMoneyFunc}
            />);
        });

        buildings.push(<ClanBuilding
            key={"money"}
            building={"money"}
            value={this.state.money}
            isMoney={true}
            isMemberCommander={true}
            incrementFunc={this.incrementFunc}
            incrementMoneyFunc={this.incrementMoneyFunc}
        />);


        return isMemberOfClan ? (
            <div className="container row" style={{backgroundColor: "white"}}>
                <div className="col s5">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Buldings</h3>
                        </li>
                        {buildings}
                    </ul>
                </div>
                <div className="col s7">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Members</h3>
                        </li>
                        {members}
                        {addNewMember}
                    </ul>
                    <div className="row center">
                        {leave}
                        {chat}
                    </div>
                </div>

            </div>
        ) : (
            <div className="container">
                <div className="collection">
                    <div className="collection-item collection-header">
                        <h3>Clan</h3>
                        {members}
                        {addNewMember}
                    </div>
                </div>
                {leave}
                {chat}
            </div>
        );
    }
}

Clan.propTypes = {
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(Clan);

