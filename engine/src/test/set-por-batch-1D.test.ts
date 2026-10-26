/**
 * Portal (POR) and Portal Second Age (P02; B190), group D. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, target: ObjectId | typeof B): boolean =>
  game.canDispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: 0,
    targets: [ref(target)],
  }) === null;

describe("King's Assassin", () => {
  it("activates in your precombat main phase, not in the second main phase or on an opponent's turn", () => {
    const { game } = table();
    const assassin = spawn(game, "King's Assassin");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    expect(canActivate(game, assassin, bears)).toBe(true);
    toStep(game, "postcombat-main");
    expect(canActivate(game, assassin, bears)).toBe(false);
    nextTurn(game); // bob's turn
    game.state.objects[bears].tapped = true;
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    expect(canActivate(game, assassin, bears)).toBe(false);
    toStep(game, "precombat-main");
    game.state.objects[bears].tapped = true;
    activate(game, assassin, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Capricious Sorcerer", () => {
  it("pings in your precombat main phase, not in the second main phase", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Capricious Sorcerer");
    toStep(game, "postcombat-main");
    expect(canActivate(game, sorcerer, B)).toBe(false);
    toStep(game, "precombat-main");
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Alabaster Dragon", () => {
  it("is shuffled into its owner's library when it dies", () => {
    const { game } = table();
    const dragon = spawn(game, "Alabaster Dragon");
    destroy(game, dragon);
    expect(zone(game, dragon)).toBe("library");
    expect(graveyard(game, A)).not.toContain(dragon);
  });
});

describe("Starlight", () => {
  it("gains 3 life for each black creature the target opponent controls", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Undying Beast", B);
    spawn(game, "Endless Cockroaches", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Undying Beast", A);
    cast(game, toHand(game, "Starlight"), { targets: [ref(B)] });
    expect(life(game)).toBe(26);
  });
});

describe("Festival of Trokin", () => {
  it("gains 2 life for each creature you control", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Festival of Trokin"));
    expect(life(game)).toBe(24);
  });
});

describe("Renewing Touch", () => {
  it("shuffles the targeted creature cards from your graveyard into your library", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const first = toGraveyard(game, "Grizzly Bears");
    const second = toGraveyard(game, "Undying Beast");
    const left = toGraveyard(game, "Endless Cockroaches");
    cast(game, toHand(game, "Renewing Touch"), { targets: [ref(first), ref(second)] });
    expect(zone(game, first)).toBe("library");
    expect(zone(game, second)).toBe("library");
    expect(zone(game, left)).toBe("graveyard");
  });
});

describe("Magma Giant", () => {
  it("deals 2 damage to each creature and each player as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = enter(game, "Magma Giant");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(life(game)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Pillaging Horde", () => {
  it("is sacrificed unless you discard a card at random", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    const kept = enter(game, "Pillaging Horde");
    expect(zone(game, kept)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
    pickModes(a);
    const lost = enter(game, "Pillaging Horde");
    expect(zone(game, lost)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Abyssal Nightstalker", () => {
  it("makes the defending player discard a card when it attacks unblocked", () => {
    const { game, a } = table();
    const stalker = spawn(game, "Abyssal Nightstalker");
    const before = hand(game, B).length;
    attack(game, a, [stalker]);
    settle(game);
    expect(hand(game, B).length).toBe(before - 1);
    expect(life(game, B)).toBe(18);
  });
});

describe("Jagged Lightning", () => {
  it("deals 3 damage to each of two different target creatures", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Jagged Lightning"), { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("Nature's Cloak", () => {
  it("gives only your green creatures forestwalk", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const beast = spawn(game, "Undying Beast");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Nature's Cloak"));
    expect(keywords(game, bears).has("forestwalk")).toBe(true);
    expect(keywords(game, beast).has("forestwalk")).toBe(false);
    expect(keywords(game, theirs).has("forestwalk")).toBe(false);
  });
});

describe("Goblin Lore", () => {
  it("draws four, then discards three at random", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const lore = toHand(game, "Goblin Lore");
    const before = hand(game).length;
    cast(game, lore);
    expect(hand(game).length).toBe(before - 1 + 4 - 3);
    expect(graveyard(game, A).length).toBe(4);
  });
});
