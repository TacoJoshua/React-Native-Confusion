import React, { Component } from "react";
import { View, Text, ScrollView, FlatList, Modal, Button, StyleSheet, Alert, PanResponder } from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from 'react-native-animatable';


const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
  const dish = props.dish;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200)
      return true;
    else
      return false;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderEnd: (e, gestureState) => {
      console.log('pan responder end', gestureState);
      if (recognizeDrag(gestureState))
        Alert.alert(
          'Add Favorite',
          'Are you sure you wish to add ' + dish.name + ' to favorite?',
          [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            { text: 'OK', onPress: () => { props.favorite ? console.log('Already Favorite') : props.onPress() } },
          ],
          { cancelable: false }
        );

      return true;
    }
  })

  if (dish != null) {
    return (
      <Animatable.View animation='fadeInDown' duration={2000} delay={1000}
        {...panResponder.panHandlers}>
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={{ flexDirection: "row" }} style={styles.cardRow}>
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite ? console.log("Already favorite") : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              style={styles.cardItem}
              onPress={() => props.onShowModal()}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingVertical: 10
          }}
          type="star"
          fractions={1}
          startingValue={item.rating}
          imageSize={12}
          onFinishRating={rating => this.setState({ rating: rating })}
        />
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}
        </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class Dishdetail extends Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  defaultState() {
    return {
      author: "",
      comment: "",
      rating: 5,
      showModal: false,
      favorites: []
    };
  }
  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  resetForm() {
    this.setState(this.defaultState());
  }

  handleComment(dishId) {
    this.toggleModal();
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment
    );
  }

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");

    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          onShowModal={() => this.toggleModal()}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
            this.resetForm();
          }}
          onRequestClose={() => {
            this.toggleModal();
            this.resetForm();
          }}
        >
          <View style={styles.modal}>
            <View>
              <Rating
                showRating
                type="star"
                fractions={1}
                startingValue={this.state.rating}
                imageSize={40}
                onFinishRating={rating => this.setState({ rating: rating })}
                style={{ paddingVertical: 10 }}
              />
            </View>
            <View>
              <Input
                placeholder=" Author"
                leftIcon={<Icon name="user-o" type="font-awesome" />}
                onChangeText={value => this.setState({ author: value })}
              />
              <Input
                placeholder=" Comment"
                leftIcon={<Icon name="comment-o" type="font-awesome" />}
                onChangeText={value => this.setState({ comment: value })}
              />
            </View>
            <View style={{ paddingVertical: 10 }}>
              <Button
                onPress={() => {
                  this.handleComment(dishId);
                  this.resetForm();
                }}
                color="#512DA8"
                title="Submit"
              />
            </View>
            <View style={{ paddingVertical: 10 }}>
              <Button
                onPress={() => {
                  this.toggleModal();
                  this.resetForm();
                }}
                color="#6C757D"
                title="Cancel"
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cardRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  cardItem: {
    flex: 1,
    margin: 10
  },
  modal: {
    justifyContent: "center",
    margin: 20
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
