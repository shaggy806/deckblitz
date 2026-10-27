/**
 * Ravnica: City of Guilds, batch 229 group B: Voyager Staff's delayed return,
 * Lore Broker's each-player loot, Hunted Dragon's tokens for the opponent,
 * Clutch of the Undercity's bounce and life loss, Blood Funnel's reduction
 * and its counter-unless-sacrifice, and Vigor Mortis's {G}-spent counter.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  spawn,
  toGraveyard,
  toHand,
  tokensNamed,
  table,
  zone,
} from "./harness.js";

describe("Voyager Staff", () => {
  it("exiles a creature and returns it under its owner's control at the next end step", () => {
    const { game } = table();
    const staff = spawn(game, "Voyager Staff");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, staff, 0, { targets: [ref(bears)] });
    expect(zone(game, staff)).toBe("graveyard");
    const exiled = game.state.zones.shared.exile.length;
    expect(exiled).toBeGreaterThan(0);
    nextTurn(game);
    const back = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back.length).toBe(1);
    expect(controller(game, back[0])).toBe(B);
  });
});

describe("Lore Broker", () => {
  it("each player draws a card, then discards a card", () => {
    const { game } = table();
    const broker = spawn(game, "Lore Broker");
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    const gyA = graveyard(game, A).length;
    const gyB = graveyard(game, B).length;
    activate(game, broker);
    expect(hand(game, A).length).toBe(handA);
    expect(hand(game, B).length).toBe(handB);
    expect(graveyard(game, A).length).toBe(gyA + 1);
    expect(graveyard(game, B).length).toBe(gyB + 1);
  });
});

describe("Hunted Dragon", () => {
  it("target opponent creates three first-strike Knights", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Hunted Dragon");
    expect(tokensNamed(game, "Knight Token (first strike)", B)).toBe(3);
    expect(tokensNamed(game, "Knight Token (first strike)", A)).toBe(0);
  });
});

describe("Clutch of the Undercity", () => {
  it("bounces a permanent and its controller loses 3 life", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Clutch of the Undercity"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Blood Funnel", () => {
  it("makes a noncreature spell {2} cheaper, and counters it with no creature to sacrifice", () => {
    const { game } = table();
    spawn(game, "Blood Funnel");
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    const before = hand(game, A).length;
    cast(game, divination);
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1);
  });

  it("lets the spell resolve when a creature is sacrificed", () => {
    const { game, a } = table();
    spawn(game, "Blood Funnel");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    pickModes(a, 0);
    pickPermanents(a, bears);
    const divination = toHand(game, "Divination");
    const before = hand(game, A).length;
    cast(game, divination);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 2);
  });
});

describe("Vigor Mortis", () => {
  it("returns the creature with a +1/+1 counter when {G} was spent", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Vigor Mortis"), { targets: [ref(bears)] });
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(counters(game, back!)).toBe(1);
  });

  it("returns it with no counter when no {G} was spent", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Vigor Mortis"), { targets: [ref(bears)] });
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(counters(game, back!)).toBe(0);
  });
});
