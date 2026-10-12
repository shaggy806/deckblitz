/**
 * The set walk, batch 63, part c (2026-10-12): Lorwyn Eclipsed.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import { hasSubtype } from "../subtypes.js";
import { computeCharacteristics } from "../characteristics.js";

const ELF = "2/2 Black Green Elf Token";

describe("Moon-Vigil Adherents", () => {
  it("gets +1/+1 for each creature you control (itself included) and each creature card in your graveyard", () => {
    const { game } = table();
    const adherents = spawn(game, "Moon-Vigil Adherents");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt");
    // Two creatures you control, one creature card in your graveyard.
    expect(pt(game, adherents)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Moonshadow", () => {
  it("enters with six -1/-1 counters and sheds one per batch of permanent cards put into your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Moonshadow"));
    const [shadow] = named(game, "Moonshadow");
    expect(counters(game, shadow, "-1/-1")).toBe(6);
    expect(pt(game, shadow)).toEqual({ power: 1, toughness: 1 });

    // A creature card of yours dies: one counter off.
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(counters(game, shadow, "-1/-1")).toBe(5);

    // A token isn't a card; an opponent's card isn't in your graveyard.
    game.debugApplyEffect(A, { kind: "create-token", token: ELF, count: 1 }, []);
    destroy(game, named(game, ELF)[0]);
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    expect(counters(game, shadow, "-1/-1")).toBe(5);

    // An instant isn't a permanent card.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, shadow, "-1/-1")).toBe(5);
  });

  it("doesn't trigger once it has no -1/-1 counter", () => {
    const { game } = table();
    const shadow = spawn(game, "Moonshadow");
    game.state.objects[shadow].counters["-1/-1"] = 0;
    // Unsettled, so a trigger would still be waiting or on the stack.
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBe(0);
    // With a counter on it, the same death does trigger.
    game.state.objects[shadow].counters["-1/-1"] = 1;
    const more = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(more)]);
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBe(1);
    settle(game);
    expect(pt(game, shadow)).toEqual({ power: 7, toughness: 7 });
  });

  it("removes exactly one counter for a batch of two", () => {
    const { game } = table();
    const shadow = spawn(game, "Moonshadow");
    game.state.objects[shadow].counters["-1/-1"] = 3;
    // Thought Scour mills two Wastes — land cards, permanent cards — in one move.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(A)] });
    expect(counters(game, shadow, "-1/-1")).toBe(2);
  });
});

describe("Morcant's Eyes", () => {
  it("makes an Elf for each Elf card in your graveyard, itself included once sacrificed", () => {
    const { game } = table();
    const eyes = spawn(game, "Morcant's Eyes");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Llanowar Elves", B);
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    activate(game, eyes);
    expect(zone(game, eyes)).toBe("graveyard");
    expect(tokensNamed(game, ELF, A)).toBe(3);
    const [elf] = named(game, ELF);
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rimefire Torque", () => {
  it("charges on a permanent of the chosen type entering, and three charges copy your next instant", () => {
    const { game } = table();
    const torque = spawn(game, "Rimefire Torque");
    game.state.objects[torque].chosenCreatureType = "Elf";
    enter(game, "Llanowar Elves");
    enter(game, "Grizzly Bears");
    // A kindred Elf enchantment is a permanent of the chosen type too.
    enter(game, "Morcant's Eyes");
    expect(counters(game, torque, "charge")).toBe(2);
    enter(game, "Llanowar Elves");
    expect(counters(game, torque, "charge")).toBe(3);

    activate(game, torque);
    expect(counters(game, torque, "charge")).toBe(0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    // Only the next one.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });
});

describe("Scarblade's Malice", () => {
  it("grants deathtouch and lifelink, and makes a 2/2 Elf when that creature dies this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Scarblade's Malice"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    destroy(game, other);
    settle(game);
    expect(tokensNamed(game, ELF, A)).toBe(0);
    destroy(game, bears);
    settle(game);
    expect(tokensNamed(game, ELF, A)).toBe(1);
  });
});

describe("Vivid", () => {
  it("Shimmercreep drains each opponent for the colours among your permanents and gains that much once", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears"); // green
    spawn(game, "Llanowar Elves"); // green again
    spawn(game, "Forest"); // a land is colourless
    spawn(game, "Hill Giant", B); // an opponent's red doesn't count
    enter(game, "Shimmercreep"); // black
    expect(life(game, B)).toBe(18);
    expect(life(game, "carol" as typeof B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("Shinestriker draws a card per colour among your permanents", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const before = hand(game).length;
    enter(game, "Shinestriker");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Stalactite Dagger", () => {
  it("makes a changeling Shapeshifter, and the equipped creature gets +1/+1 and is every creature type", () => {
    const { game } = table();
    const dagger = spawn(game, "Stalactite Dagger");
    const bears = spawn(game, "Grizzly Bears");
    const isA = (type: string): boolean =>
      hasSubtype(computeCharacteristics(game.state, game.registry, bears).subtypes, type);
    expect(isA("Goblin")).toBe(false);
    lands(game, "Wastes", 2);
    activate(game, dagger, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(isA("Goblin")).toBe(true);
    expect(isA("Bear")).toBe(true);
    enter(game, "Stalactite Dagger");
    expect(tokensNamed(game, "Shapeshifter Token", A)).toBe(1);
  });
});
