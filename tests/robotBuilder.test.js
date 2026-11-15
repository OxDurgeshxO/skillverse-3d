import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RobotBuilder } from '../src/entities/RobotBuilder.js';

const SKILL_TYPES = [
  'coding', 'ai_ml', 'engineering', 'medicine', 'design',
  'business', 'web_dev', 'cybersecurity', 'space', 'science',
  'art', 'music', 'agriculture', 'travel', 'sports',
  'cooking', 'teaching', 'communication'
];

test('RobotBuilder: Instantiates all 18 skill robot species without errors', () => {
  const builder = new RobotBuilder();
  assert.equal(SKILL_TYPES.length, 18, 'Must verify all 18 humanoid skill species');

  SKILL_TYPES.forEach(type => {
    const robot = builder.createRobot(type);
    assert.ok(robot instanceof THREE.Group, `${type} must return a THREE.Group`);
    assert.ok(robot.userData.armLeft, `${type} must have armLeft initialized`);
    assert.ok(robot.userData.armRight, `${type} must have armRight initialized`);
    assert.ok(robot.userData.legLeft, `${type} must have legLeft initialized`);
    assert.ok(robot.userData.legRight, `${type} must have legRight initialized`);
    assert.ok(robot.userData.headGroup, `${type} must have headGroup initialized`);
    assert.ok(robot.userData.badge, `${type} must have floating skill badge initialized`);
    assert.ok(robot.scale.x > 0 && robot.scale.x < 0.1, `${type} scale factor must be miniaturized`);
  });
});

test('RobotBuilder: Signature accessories attached correctly', () => {
  const builder = new RobotBuilder();

  // Coding Robot: circuit veins and holographic keyboard
  const coding = builder.createRobot('coding');
  assert.ok(coding.userData.accessory, 'Coding Robot must have holographic keyboard');

  // Travel Robot: hiking boots and backpack
  const travel = builder.createRobot('travel');
  assert.equal(travel.userData.legLeft.children.length, 3, 'Travel Robot must have hiking boot on left leg');
  assert.equal(travel.userData.legRight.children.length, 3, 'Travel Robot must have hiking boot on right leg');

  // Communication Robot: dynamic equalizer bars and microphone
  const comm = builder.createRobot('communication');
  assert.ok(comm.userData.eqBars && comm.userData.eqBars.length === 5, 'Communication Robot must have 5 equalizer bars');
  assert.equal(comm.userData.armRight.children.length, 3, 'Communication Robot must have micro-mic on right arm');
});

test('RobotBuilder: Animates walking and idle gestures without throwing', () => {
  const builder = new RobotBuilder();
  const robot = builder.createRobot('coding');

  assert.doesNotThrow(() => {
    builder.animateRobot(robot, 1.5, true, 3.6);
    builder.animateRobot(robot, 2.0, false, 3.6);
  });
});
