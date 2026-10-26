/**
 * Innistrad and Magic 2012 (ISD, M12; B191) — group B: Selhoff Occultist's
 * any-creature dies trigger, Manor Gargoyle's indestructible-while-defender,
 * Chandra's Phoenix's graveyard trigger, bloodthirst, Mind Unbound's growing
 * draw, Night Revelers' conditional haste, Garruk's Horde and Scepter of
 * Empires.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("Selhoff Occultist", () => {
  it("mills the target player when it dies, and when another creature dies", () => {
    const { game, a } = table();
    const occultist = spawn(game, "Selhoff Occultist");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const before = graveyard(game, B).length;
    destroy(game, bears);
    expect(graveyard(game, B).length).toBe(before + 2); // the Bears and a milled card
    destroy(game, occultist);
    expect(graveyard(game, B).length).toBe(before + 3);
  });
});

describe("Manor Gargoyle", () => {
  it("is indestructible with defender, and loses both for flying when activated", () => {
    const { game } = table();
    const gargoyle = spawn(game, "Manor Gargoyle");
    lands(game, "Wastes", 1);
    expect(keywords(game, gargoyle).has("indestructible")).toBe(true);
    destroy(game, gargoyle);
    expect(zone(game, gargoyle)).toBe("battlefield");
    activate(game, gargoyle);
    const kw = keywords(game, gargoyle);
    expect(kw.has("flying")).toBe(true);
    expect(kw.has("defender")).toBe(false);
    expect(kw.has("indestructible")).toBe(false);
    destroy(game, gargoyle);
    expect(zone(game, gargoyle)).toBe("graveyard");
  });
});

describe("Chandra's Phoenix", () => {
  it("returns to hand when a red instant you control deals damage to an opponent", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Chandra's Phoenix");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, phoenix)).toBe("hand");
  });

  it("stays put when the red instant hits a creature", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Chandra's Phoenix");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, phoenix)).toBe("graveyard");
  });
});

describe("Bloodthirst (Gorehorn Minotaurs, Duskhunter Bat)", () => {
  it("enters with no counters unless an opponent was dealt damage this turn", () => {
    const { game } = table();
    const first = enter(game, "Gorehorn Minotaurs");
    expect(counters(game, first)).toBe(0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const second = enter(game, "Gorehorn Minotaurs");
    expect(counters(game, second)).toBe(2);
    const bat = enter(game, "Duskhunter Bat");
    expect(counters(game, bat)).toBe(1);
  });

  it("damage to yourself doesn't count", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    const bat = enter(game, "Duskhunter Bat");
    expect(counters(game, bat)).toBe(0);
  });
});

describe("Mind Unbound", () => {
  it("adds a lore counter each upkeep and draws one card per counter", () => {
    const { game } = table();
    const mind = spawn(game, "Mind Unbound");
    nextTurn(game); // bob's turn: no trigger
    const before = hand(game, A).length;
    nextTurn(game); // alice's: one counter, draw step + 1
    expect(counters(game, mind, "lore")).toBe(1);
    expect(hand(game, A).length).toBe(before + 2);
    nextTurn(game);
    nextTurn(game); // two counters: draw step + 2
    expect(counters(game, mind, "lore")).toBe(2);
    expect(hand(game, A).length).toBe(before + 5);
  });
});

describe("Night Revelers", () => {
  it("has haste only while an opponent controls a Human", () => {
    const { game } = table();
    const revelers = spawn(game, "Night Revelers");
    expect(keywords(game, revelers).has("haste")).toBe(false);
    spawn(game, "Elite Vanguard", A);
    expect(keywords(game, revelers).has("haste")).toBe(false);
    spawn(game, "Elite Vanguard", B);
    expect(keywords(game, revelers).has("haste")).toBe(true);
  });
});

describe("Garruk's Horde", () => {
  it("casts a creature spell off the top, not an instant", () => {
    const { game } = table();
    spawn(game, "Garruk's Horde");
    lands(game, "Forest", 2);
    const shock = toLibrary(game, "Shock");
    expect(castOffers(game, shock)).toHaveLength(0);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(castOffers(game, bears)).toHaveLength(1);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "library-top" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Scepter of Empires", () => {
  it("deals 1 damage to the target player without the Crown and Throne", () => {
    const { game } = table();
    const scepter = spawn(game, "Scepter of Empires");
    activate(game, scepter, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});
