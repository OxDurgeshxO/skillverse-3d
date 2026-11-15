import test from 'node:test';
import assert from 'node:assert/strict';
import { SkillverseCoordinator } from '../src/core/SkillverseCoordinator.js';

test('SkillverseCoordinator: Registers events and notifies subscribers', () => {
  const coordinator = new SkillverseCoordinator({});
  let receivedTime = -1;

  coordinator.on('time_update', t => {
    receivedTime = t;
  });

  coordinator.setTime(4.25);
  assert.equal(coordinator.state.currentTime, 4.25);
  assert.equal(receivedTime, 4.25);
});

test('SkillverseCoordinator: Manages camera modes and festival toggle', () => {
  const coordinator = new SkillverseCoordinator({});
  let modeChanged = '';
  let festivalToggled = false;

  coordinator.on('camera_mode_change', mode => {
    modeChanged = mode;
  });

  coordinator.on('festival_toggle', state => {
    festivalToggled = state;
  });

  coordinator.setCameraMode('orbit');
  assert.equal(coordinator.state.cameraMode, 'orbit');
  assert.equal(modeChanged, 'orbit');

  const res = coordinator.toggleFestival();
  assert.equal(res, true);
  assert.equal(coordinator.state.isFestivalActive, true);
  assert.equal(festivalToggled, true);
});
