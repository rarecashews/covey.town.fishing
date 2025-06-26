import { nanoid } from 'nanoid';
import PlayerController from './PlayerController';
import { GameItem, PlayerInventory, PlayerLocation } from '../types/CoveyTownSocket';
describe('PlayerInventory', () => {
  const playerLocation: PlayerLocation = {
    x: 0,
    y: 0,
    rotation: 'front',
    moving: false,
  };
  let testController: PlayerController;
  const item1: GameItem = { id: 1, description: 'test item' };
  const item2: GameItem = { id: 2, description: 'test item' };
  const item3: GameItem = { id: 3, description: 'test item' };
  const inventory: PlayerInventory = [item1, item2, item3];
  beforeEach(() => {
    testController = new PlayerController(nanoid(), 'test', playerLocation);
  });
  it('adds GameItems to the inventory', () => {
    expect(testController.inventory.length).toBe(0);
    testController.addToInventory(item1);
    testController.addToInventory(item2);
    testController.addToInventory(item3);
    expect(testController.inventory.length).toBe(3);
  });
  it('adds the correct GameItems to the inventory', () => {
    testController.addToInventory(item1);
    testController.addToInventory(item2);
    testController.addToInventory(item3);
    expect(testController.inventory).toContain(item1);
    expect(testController.inventory).toContain(item2);
    expect(testController.inventory).toContain(item3);
  });
  it('removes GameItems from the inventory', () => {
    testController.inventory = inventory;
    expect(testController.inventory.length).toBe(3);
    testController.removeFromInventory(item1);
    testController.removeFromInventory(item2);
    testController.removeFromInventory(item3);
    expect(testController.inventory.length).toBe(0);
  });
  it('removes the correct GameItem from the inventory', () => {
    testController.inventory = inventory;
    expect(testController.inventory).toContain(item1);
    testController.removeFromInventory(item1);
    expect(testController.inventory).not.toContain(item1);
  });
  it('emits an inventoryChanged event when the inventory is set', () => {
    const emitSpy = jest.spyOn(testController, 'emit');
    testController.inventory = inventory;
    const inventoryChangedCall = emitSpy.mock.calls.find(call => call[0] === 'inventoryChanged');
    expect(inventoryChangedCall).toBeDefined();
    if (inventoryChangedCall) {
      expect(inventoryChangedCall[1]).toEqual(inventory);
    }
  });
  it('emits an inventoryChanged event when an item is added to the inventory', () => {
    const emitSpy = jest.spyOn(testController, 'emit');
    testController.addToInventory(item1);
    const inventoryChangedCall = emitSpy.mock.calls.find(call => call[0] === 'inventoryChanged');
    expect(inventoryChangedCall).toBeDefined();
    if (inventoryChangedCall) {
      expect(inventoryChangedCall[1]).toEqual([item1]);
    }
  });
  it('emits an inventoryChanged event when an item is removed from the inventory', () => {
    testController.inventory = inventory;
    const emitSpy = jest.spyOn(testController, 'emit');
    testController.removeFromInventory(item1);
    const inventoryChangedCall = emitSpy.mock.calls.find(call => call[0] === 'inventoryChanged');
    expect(inventoryChangedCall).toBeDefined();
    if (inventoryChangedCall) {
      expect(inventoryChangedCall[1]).toEqual([item2, item3]);
    }
  });
});
