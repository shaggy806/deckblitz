/**
 * Set walk batch 85, part e (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const isFaceDown = (game: Game, id: ObjectId): boolean => game.state.objects[id].faceDown !== undefined;
/** The face-down permanents alice controls. */
const faceDown = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].controller === A && isFaceDown(game, id));

/** Cast a Room's `door` (1 left, 2 right) from the hand. */
const castDoor = (game: Game, name: string, door: 1 | 2): ObjectId => {
  const room = toHand(game, name);
  game.dispatch({ type: "cast-spell", player: A, card: room, face: door, targets: [] });
  settle(game);
  return room;
};

describe("Survival: Defiant Survivor, Cautious Survivor, Shrewd Storyteller, Savior of the Small", () => {
  it("Defiant Survivor manifests dread if it's tapped as your second main phase begins", () => {
    const { game, a } = table();
    const survivor = spawn(game, "Defiant Survivor");
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [giant];
    attack(game, a, [survivor]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(isFaceDown(game, giant)).toBe(true);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Defiant Survivor does nothing untapped", () => {
    const { game } = table();
    spawn(game, "Defiant Survivor");
    toStep(game, "postcombat-main");
    settle(game);
    expect(faceDown(game)).toHaveLength(0);
  });

  it("Cautious Survivor gains 2 life only while tapped", () => {
    const { game, a } = table();
    const survivor = spawn(game, "Cautious Survivor");
    toStep(game, "postcombat-main");
    settle(game);
    expect(life(game, A)).toBe(20);
    toStep(game, "precombat-main");
    attack(game, a, [survivor]);
    settle(game);
    expect(life(game, A)).toBe(22);
  });

  it("Shrewd Storyteller puts a +1/+1 counter on target creature, any player's", () => {
    const { game, a } = table();
    const teller = spawn(game, "Shrewd Storyteller", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, teller)).toBe(0);
  });

  it("Savior of the Small returns a creature card with mana value 3 or less from your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Savior of the Small", A, { tapped: true });
    const bears = toGraveyard(game, "Grizzly Bears");
    const goblin = toGraveyard(game, "Goblin Piker");
    const giant = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "postcombat-main");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(goblin);
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(hand(game)).toContain(bears);
  });

  it("Savior of the Small does nothing if it's untapped by the time it resolves", () => {
    const { game, a } = table();
    const savior = spawn(game, "Savior of the Small", A, { tapped: true });
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length > 0);
    game.state.objects[savior].tapped = false;
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Unwilling Vessel", () => {
  it("gets a possession counter for each enchantment entering and each fully unlocked Room", () => {
    const { game, a } = table();
    const vessel = spawn(game, "Unwilling Vessel");
    enter(game, "Glorious Anthem");
    expect(counters(game, vessel, "possession")).toBe(1);
    // An opponent's enchantment doesn't count.
    enter(game, "Glorious Anthem", B);
    expect(counters(game, vessel, "possession")).toBe(1);
    toStep(game, "precombat-main");
    lands(game, "Island", 6);
    pickTargets(a, null);
    // One door: an enchantment entering, not a full unlock.
    const room = castDoor(game, "Bottomless Pool // Locker Room", 1);
    expect(counters(game, vessel, "possession")).toBe(2);
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(counters(game, vessel, "possession")).toBe(3);
  });

  it("dies into an X/X blue flying Spirit, X counting every counter it had", () => {
    const { game } = table();
    const vessel = spawn(game, "Unwilling Vessel");
    game.state.objects[vessel].counters = { possession: 2, "+1/+1": 1 };
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(vessel)]);
    settle(game);
    const [spirit] = named(game, "Spirit Token (Unwilling Vessel)");
    expect(spirit).toBeDefined();
    expect(pt(game, spirit)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, spirit).has("flying")).toBe(true);
    expect(game.state.objects[spirit].isToken).toBe(true);
  });
});

describe("Fear of Immobility", () => {
  it("taps an opponent's creature and stuns it", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Fear of Immobility"));
    expect(isTapped(game, giant)).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });

  it("taps your own creature without a stun counter, or nothing at all", () => {
    const { game, a } = table();
    lands(game, "Plains", 10);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Fear of Immobility"));
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(0);
    // Up to one: none is fine.
    pickTargets(a, null);
    const fear = toHand(game, "Fear of Immobility");
    cast(game, fear);
    expect(zone(game, fear)).toBe("battlefield");
  });
});

describe("Cryptid Inspector", () => {
  it("grows when a face-down permanent you control enters and when it's turned face up", () => {
    const { game, a } = table();
    const inspector = spawn(game, "Cryptid Inspector");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [bears];
    enter(game, "Unsettling Twins");
    expect(isFaceDown(game, bears)).toBe(true);
    expect(counters(game, inspector)).toBe(1);
    lands(game, "Forest", 2);
    game.dispatch({ type: "turn-face-up", player: A, permanent: bears } as Action);
    settle(game);
    expect(isFaceDown(game, bears)).toBe(false);
    expect(counters(game, inspector)).toBe(2);
  });

  it("grows when it's turned face up itself, not for an opponent's face-down permanent", () => {
    const { game, a, b } = table();
    const inspector = toLibrary(game, "Cryptid Inspector");
    toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [inspector];
    enter(game, "Unsettling Twins");
    expect(isFaceDown(game, inspector)).toBe(true);
    lands(game, "Forest", 3);
    game.dispatch({ type: "turn-face-up", player: A, permanent: inspector } as Action);
    settle(game);
    expect(counters(game, inspector)).toBe(1);
    // Bob's manifest isn't yours.
    const theirs = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Lightning Bolt", B);
    b.chooseFromZoneFn = () => [theirs];
    enter(game, "Unsettling Twins", B);
    expect(isFaceDown(game, theirs)).toBe(true);
    expect(counters(game, inspector)).toBe(1);
  });
});

describe("Bear Trap", () => {
  it("has flash, and sacrifices to deal 3 damage to target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const trap = spawn(game, "Bear Trap");
    expect(keywords(game, trap).has("flash")).toBe(true);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, trap, 0, { targets: [ref(giant)] });
    expect(zone(game, trap)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Conductive Machete and Killer's Mask", () => {
  it("Conductive Machete manifests dread and attaches to it: a 4/3", () => {
    const { game } = table();
    const machete = enter(game, "Conductive Machete");
    const host = game.state.objects[machete].attachedTo;
    expect(host).not.toBeNull();
    expect(isFaceDown(game, host!)).toBe(true);
    expect(pt(game, host!)).toEqual({ power: 4, toughness: 3 });
  });

  it("Killer's Mask manifests dread and gives it menace; equips for {2}", () => {
    const { game } = table();
    const mask = enter(game, "Killer's Mask");
    const host = game.state.objects[mask].attachedTo;
    expect(host).not.toBeNull();
    expect(isFaceDown(game, host!)).toBe(true);
    expect(keywords(game, host!).has("menace")).toBe(true);
    toStep(game, "precombat-main");
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, mask, 0, { targets: [ref(bears)] });
    expect(game.state.objects[mask].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("Attack-in-the-Box", () => {
  it("may get +4/+0 as it attacks, and is then sacrificed at the next end step", () => {
    const { game, a } = table();
    const box = spawn(game, "Attack-in-the-Box");
    pickModes(a, 0);
    attack(game, a, [box]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, box)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, box)).toBe("graveyard");
  });

  it("declined, it stays a 2/4 and stays on the battlefield", () => {
    const { game, a } = table();
    const box = spawn(game, "Attack-in-the-Box");
    pickModes(a);
    attack(game, a, [box]);
    expect(life(game, B)).toBe(18);
    toStep(game, "end");
    settle(game);
    expect(zone(game, box)).toBe("battlefield");
  });
});

describe("Unsettling Twins", () => {
  it("manifests dread as it enters", () => {
    const { game, a } = table();
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [giant];
    enter(game, "Unsettling Twins");
    expect(isFaceDown(game, giant)).toBe(true);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(graveyard(game)).toContain(bolt);
  });
});

describe("Baseball Bat", () => {
  it("attaches to target creature you control as it enters, for +1/+1", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const bat = toHand(game, "Baseball Bat");
    cast(game, bat);
    expect(game.state.objects[bat].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("taps up to one target creature whenever equipped creature attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Baseball Bat");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    attack(game, a, [bears]);
    expect(isTapped(game, giant)).toBe(true);
    expect(life(game, B)).toBe(17);
  });
});

describe("Vicious Clown", () => {
  it("gets +2/+0 whenever another creature you control with power 2 or less enters", () => {
    const { game } = table();
    const clown = spawn(game, "Vicious Clown");
    enter(game, "Grizzly Bears");
    expect(pt(game, clown)).toEqual({ power: 4, toughness: 3 });
    // Power 3: nothing. An opponent's: nothing.
    enter(game, "Hill Giant");
    enter(game, "Grizzly Bears", B);
    expect(pt(game, clown)).toEqual({ power: 4, toughness: 3 });
  });
});
