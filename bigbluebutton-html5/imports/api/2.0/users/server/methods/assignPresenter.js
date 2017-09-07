import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis2x';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users';

export default function assignPresenter(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'AssignPresenterReqMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const User = Users.findOne({
    meetingId,
    userId,
  });

  if (!User) {
    throw new Meteor.Error(
      'user-not-found', 'You need a valid user to be able to set presenter');
  }

  const payload = {
    newPresenterId: userId,
    newPresenterName: User.name,
    assignedBy: requesterUserId,
    requesterId: requesterUserId,
  };

  Logger.verbose(`User '${userId}' setted as presenter by '${
    requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, meetingId, payload, { userId: User.userId });
}