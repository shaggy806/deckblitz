/**
 * The set walk: Apocalypse (APC; B218), group A.
 */
import { describe, expect, it } from "vitest";
import type { BlockOffer } from "./harness.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  graveyard,
  hand,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { ObjectId } from "../primitives.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] | undefined =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock;

describe("Orim's Thunder", () => {
  it("kicked, destroys the artifact and deals its mana value to the creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    const stone = spawn(game, "Mind Stone", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Orim's Thunder"), { kicked: true, targets: [ref(stone), ref(bears)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("kicked, deals no damage when the artifact is gone before it resolves", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    const stone = spawn(game, "Mind Stone", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Orim's Thunder"), { kicked: true, targets: [ref(stone), ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(stone)]);
    settle(game);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Aether Mutation", () => {
  it("bounces the creature and makes Saprolings equal to its mana value", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Aether Mutation"), { targets: [ref(giant)] });
    expect(hand(game, B)).toContain(giant);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(4);
  });
});

describe("Quicksilver Dagger", () => {
  it("gives the creature a tap ability that pings a player and draws its controller a card", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Quicksilver Dagger"), { targets: [ref(bears)] });
    const before = hand(game).length;
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Dega Sanctuary", () => {
  it("gains 4 with a black and a red permanent, 2 with one, nothing with neither", () => {
    const { game } = table();
    spawn(game, "Dega Sanctuary");
    toStep(game, "draw");
    expect(life(game)).toBe(20);
    spawn(game, "Llanowar Elves"); // green: still nothing
    spawn(game, "Raging Goblin");
    toStep(game, "draw");
    expect(life(game)).toBe(22);
    spawn(game, "Walking Corpse");
    toStep(game, "draw");
    expect(life(game)).toBe(26);
  });
});

describe("Manacles of Decay", () => {
  it("{R} stops the enchanted creature blocking this turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Manacles of Decay"), { targets: [ref(giant)] });
    const manacles = named(game, "Manacles of Decay")[0];
    expect(game.state.objects[manacles].attachedTo).toBe(giant);
    const [mountain] = lands(game, "Mountain", 1);
    activate(game, manacles, 1);
    expect(game.state.objects[mountain].tapped).toBe(true);
    // Its only creature can't block, so Bob is never asked; next turn it can.
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "postcombat-main");
    expect(game.state.turn.number).toBe(1);
    expect(game.state.awaiting?.kind).not.toBe("blockers");
    expect(life(game, B)).toBe(18);
    game.advanceUntil((s) => s.turn.number === 3 && s.awaiting?.kind === "blockers");
    expect(canBlock(blockOffer(game, a, [bears]), giant)).toEqual([bears]);
  });
});

describe("Night // Day", () => {
  it("Day gives the target player's creatures +1/+1", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Night // Day"), { face: 2, targets: [ref(A)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Night gives the target creature -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Night // Day"), { face: 1, targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fungal Shambler", () => {
  it("its damage to an opponent draws you a card and makes them discard", () => {
    const { game, a } = table();
    const shambler = spawn(game, "Fungal Shambler");
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    attack(game, a, [shambler]);
    expect(life(game, B)).toBe(14);
    expect(hand(game).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs - 1);
    expect(graveyard(game, B).length).toBe(1);
  });
});

describe("Kavu Mauler", () => {
  it("gets +1/+1 for each other attacking Kavu", () => {
    const { game, a } = table();
    const mauler = spawn(game, "Kavu Mauler");
    const climber = spawn(game, "Kavu Climber");
    attack(game, a, [mauler, climber]);
    expect(pt(game, mauler)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Minotaur Illusionist", () => {
  it("sacrificed, deals damage equal to its power to the target creature", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const minotaur = spawn(game, "Minotaur Illusionist");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, minotaur, 1, { targets: [ref(giant)] });
    expect(zone(game, minotaur)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
