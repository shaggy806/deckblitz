/**
 * Card batch 49 (2026-10-11): the Kindred cards (rule 308) — the card type is
 * in `kindred.test.ts`; these are the clauses most likely to be wrong on the
 * cards it let in. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { hasSubtype } from "../subtypes.js";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Bitterblossom", () => {
  it("costs 1 life and makes a flying Faerie Rogue each upkeep", () => {
    const { game } = table();
    spawn(game, "Bitterblossom");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(tokensNamed(game, "Faerie Rogue Token", A)).toBe(1);
  });
});

describe("All Is Dust", () => {
  it("each player sacrifices every coloured permanent, and keeps colourless ones", () => {
    const { game } = table();
    lands(game, "Wastes", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const blossom = spawn(game, "Bitterblossom");
    const idol = spawn(game, "Idol of False Gods", B);
    const devastator = spawn(game, "Eldrazi Devastator");
    cast(game, toHand(game, "All Is Dust"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, blossom)).toBe("graveyard");
    expect(zone(game, idol)).toBe("battlefield");
    expect(zone(game, devastator)).toBe("battlefield");
  });
});

describe("Ashling's Command", () => {
  it("deals 2 to each creature only the targeted player controls, and gives Treasures to the other target", () => {
    const { game } = table({ players: 3 });
    lands(game, "Volcanic Island", 5);
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ashling's Command"), { modes: [2, 3], targets: [ref(B), ref(A)] });
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });
});

describe("Idol of False Gods", () => {
  it("grows when another Eldrazi you control dies, and at eight counters is a creature with annihilator 2", () => {
    const { game } = table();
    const idol = spawn(game, "Idol of False Gods");
    const devastator = spawn(game, "Eldrazi Devastator");
    expect(types(game, idol)).not.toContain("creature");
    destroy(game, devastator);
    expect(counters(game, idol)).toBe(1);
    game.state.objects[idol].counters = { ...game.state.objects[idol].counters, "+1/+1": 8 };
    expect(types(game, idol)).toContain("creature");
    expect(pt(game, idol)).toEqual({ power: 8, toughness: 8 });
    expect(subtypes(game, idol)).toContain("Eldrazi");
  });
});

describe("Prowess of the Fair", () => {
  it("makes an Elf Warrior for a nontoken Elf you own dying, not for a token", () => {
    const { game, a } = table();
    spawn(game, "Prowess of the Fair");
    pickModes(a, 0);
    const elf = spawn(game, "Llanowar Elves");
    destroy(game, elf);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(1);
    const [warrior] = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Elf Warrior Token",
    );
    destroy(game, warrior);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(0);
  });
});

describe("Thornbite Staff", () => {
  it("may attach itself to an opponent's Shaman as it enters, and stays yours", () => {
    const { game, a } = table();
    const staff = spawn(game, "Thornbite Staff");
    pickModes(a, 0);
    const shaman = enter(game, "Akki Drillmaster", B);
    settle(game);
    expect(game.state.objects[staff].attachedTo).toBe(shaman);
    expect(controller(game, staff)).toBe(A);
  });

  it("gives the equipped creature a pinger that untaps when a creature dies", () => {
    const { game } = table();
    const staff = spawn(game, "Thornbite Staff");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 6);
    activate(game, staff, 0, { targets: [ref(bears)] });
    expect(game.state.objects[staff].attachedTo).toBe(bears);
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].tapped).toBe(true);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Firdoch Core", () => {
  it("becomes a 4/4 artifact creature that's still every creature type", () => {
    const { game } = table();
    const core = spawn(game, "Firdoch Core");
    lands(game, "Wastes", 4);
    activate(game, core, 1);
    expect(types(game, core)).toEqual(expect.arrayContaining(["kindred", "artifact", "creature"]));
    expect(pt(game, core)).toEqual({ power: 4, toughness: 4 });
    expect(hasSubtype(subtypes(game, core), "Goblin")).toBe(true);
  });
});

describe("Crib Swap", () => {
  it("exiles the creature and its controller gets a changeling Shapeshifter", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Crib Swap"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Shapeshifter Token", B)).toBe(1);
    expect(tokensNamed(game, "Shapeshifter Token", A)).toBe(0);
  });
});

describe("Eldrazi Conscription", () => {
  it("gives +10/+10 and trample (annihilator is the shared helper Artisan of Kozilek runs)", () => {
    const { game } = table();
    lands(game, "Wastes", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Eldrazi Conscription"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 12, toughness: 12 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Touch the Spirit Realm (a fix found by batch 49)", () => {
  it("returns what it exiled when it leaves the battlefield", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const touch = enter(game, "Touch the Spirit Realm");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, touch);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
