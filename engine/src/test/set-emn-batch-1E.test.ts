/**
 * Eldritch Moon and Conspiracy: Take the Crown, group E. One test per clause
 * most likely to be wrong: Lieutenants of the Guard's council's dilemma,
 * Garrulous Sycophant's monarch gate, Lupine Prototype's "a player has no
 * cards in hand", Cemetery Recruitment's Zombie draw, Ruthless Disposal's
 * sacrificed creature as a target, Bloodhall Priest's
 * empty-hand gate, Whispers of Emrakul's delirium, Crop Sigil's two returns,
 * Furyblade Vampire's discard and Clear Shot's pumped damage.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Alice plays every land in her hand (the table deals Wastes), leaving it empty. */
function emptyHand(game: Game): void {
  for (const card of [...hand(game)]) game.dispatch({ type: "play-land", player: A, card });
  expect(hand(game)).toHaveLength(0);
}

/** Four card types in alice's graveyard: delirium. */
function delirium(game: Game): void {
  toGraveyard(game, "Forest");
  toGraveyard(game, "Shock");
  toGraveyard(game, "Divination");
  toGraveyard(game, "Ornithopter");
}

describe("Lieutenants of the Guard", () => {
  it("puts a counter on itself per strength vote and makes a Soldier per numbers vote", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const lieutenants = enter(game, "Lieutenants of the Guard");
    expect(counters(game, lieutenants)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });
});

describe("Garrulous Sycophant", () => {
  it("drains each opponent at your end step only while you're the monarch", () => {
    const { game } = table();
    spawn(game, "Garrulous Sycophant");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
    enter(game, "Court of Ardenvale");
    expect(game.state.monarch).toBe(A);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Lupine Prototype", () => {
  it("can't attack while every player has a card in hand, and can once one has none", () => {
    const { game, a } = table();
    const lupine = spawn(game, "Lupine Prototype");
    spawn(game, "Hill Giant", B);
    expect(() => blockOffer(game, a, [lupine])).toThrow();
  });

  it("attacks once alice's hand is empty", () => {
    const { game, a } = table();
    const lupine = spawn(game, "Lupine Prototype");
    emptyHand(game);
    attack(game, a, [lupine]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Cemetery Recruitment", () => {
  it("draws a card when the returned creature card is a Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const zombie = toGraveyard(game, "Liliana's Elite");
    const spell = toHand(game, "Cemetery Recruitment");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 1 + 1);
  });

  it("draws nothing for a non-Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Cemetery Recruitment");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before);
  });
});

describe("Ruthless Disposal", () => {
  it("may target the creature sacrificed to cast it; the other target still gets -13/-13", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const fodder = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const spell = toHand(game, "Ruthless Disposal");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(fodder), ref(giant)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    // The spell and one discarded card left the hand.
    expect(hand(game).length).toBe(before - 2);
  });
});

describe("Bloodhall Priest", () => {
  it("deals 2 damage as it enters with no cards in your hand", () => {
    const { game, a } = table();
    emptyHand(game);
    pickTargets(a, B);
    enter(game, "Bloodhall Priest");
    expect(life(game, B)).toBe(18);
  });

  it("doesn't trigger with a card in hand", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Bloodhall Priest");
    expect(life(game, B)).toBe(20);
  });
});

describe("Whispers of Emrakul", () => {
  it("makes the opponent discard two at random with delirium", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    delirium(game);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Whispers of Emrakul"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("one without", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Whispers of Emrakul"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Crop Sigil", () => {
  it("returns a creature card and a land card with delirium", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const sigil = spawn(game, "Crop Sigil");
    delirium(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    activate(game, sigil, 0, { targets: [ref(bears), ref(forest)] });
    expect(zone(game, sigil)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
  });

  it("can't be activated without delirium", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const sigil = spawn(game, "Crop Sigil");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, sigil, 0, { targets: [ref(bears), null] })).toThrow();
  });
});

describe("Furyblade Vampire", () => {
  it("gets +3/+0 when you discard a card at the beginning of combat", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Furyblade Vampire");
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, vampire)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Clear Shot", () => {
  it("pumps your creature, then it deals damage equal to its new power", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Clear Shot"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, giant)).toBe("graveyard");
  });
});
