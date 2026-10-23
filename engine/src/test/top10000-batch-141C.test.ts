/**
 * Card batch 141, group C (2026-10-23): EDHREC ranks 7181–7451 and the
 * improvise rechecks. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Bottle-Cap Blast", () => {
  it("makes a tapped Treasure for each point of excess damage to a creature, improvised", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const relics = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bottle-Cap Blast"), {
      targets: [ref(bears)],
      convoke: relics.map((creature) => ({ creature })),
    });
    expect(zone(game, bears)).toBe("graveyard");
    const treasures = named(game, "Treasure Token", A);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    expect(treasures.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("makes none when it hits a player", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Bottle-Cap Blast"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Universal Surveillance", () => {
  it("improvises the X", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const relics = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    const card = toHand(game, "Universal Surveillance");
    const before = hand(game).length;
    cast(game, card, { x: 2, convoke: relics.map((creature) => ({ creature })) });
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Casey Jones, Back Alley Brute", () => {
  it("deals damage equal to the +1/+1 counters you put on a creature you control", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const casey = spawn(game, "Casey Jones, Back Alley Brute");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(counters(game, casey)).toBe(0);
  });

  it("attacking, puts a counter on an attacking creature, which then pings the opponent", () => {
    const { game, a } = table();
    const casey = spawn(game, "Casey Jones, Back Alley Brute");
    watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    attack(game, a, [casey]);
    expect(counters(game, casey)).toBe(1);
    // 1 from the counter trigger, 5 combat damage from a 5/3.
    expect(life(game, B)).toBe(14);
  });
});

describe("Pattern of Rebirth", () => {
  it("lets the dead creature's controller — not the Aura's — search for a creature", () => {
    const { game, b } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = toLibrary(game, "Craw Wurm", B);
    cast(game, toHand(game, "Pattern of Rebirth"), { targets: [ref(bears)] });
    pickModes(b, 0);
    pickFromZone(b, wurm);
    destroy(game, bears, A);
    settle(game);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].controller).toBe(B);
  });
});

describe("Grand Architect", () => {
  it("pumps other blue creatures and taps any blue creature, itself included, for {C}{C}", () => {
    const { game } = table();
    const architect = spawn(game, "Grand Architect", A, { sick: true });
    const merfolk = spawn(game, "Merfolk of the Pearl Trident");
    expect(pt(game, merfolk)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, architect)).toEqual({ power: 1, toughness: 3 });
    game.dispatch({ type: "activate-ability", player: A, source: architect, abilityIndex: 1, targets: [], tap: [architect] });
    expect(game.state.objects[architect].tapped).toBe(true);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "C")).toHaveLength(2);
  });

  it("turns an artifact creature blue, so the anthem reaches it", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const architect = spawn(game, "Grand Architect");
    const thopter = spawn(game, "Ornithopter");
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 2 });
    activate(game, architect, 0, { targets: [ref(thopter)] });
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Shadow Alley Denizen", () => {
  it("gives a target creature intimidate when another black creature you control enters", () => {
    const { game, a } = table();
    const denizen = spawn(game, "Shadow Alley Denizen");
    pickTargets(a, denizen);
    enter(game, "Walking Corpse");
    expect(keywords(game, denizen).has("intimidate")).toBe(true);
  });
});

describe("Primal Bellow", () => {
  it("gives +1/+1 for each Forest you control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Primal Bellow"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Growth Spasm", () => {
  it("fetches a basic land tapped and makes an Eldrazi Spawn", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    cast(game, toHand(game, "Growth Spasm"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(1);
  });
});

describe("Ring of Evos Isle", () => {
  it("puts a +1/+1 counter on the equipped creature at upkeep only if it's blue", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const ring = spawn(game, "Ring of Evos Isle");
    const merfolk = spawn(game, "Merfolk of the Pearl Trident");
    activate(game, ring, 1, { targets: [ref(merfolk)] });
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, merfolk)).toBe(1);
  });
});

describe("Scytheclaw", () => {
  it("makes the damaged player lose half their life, rounded up, after combat damage", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const claw = spawn(game, "Scytheclaw");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, claw, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    // 3 combat damage (20 → 17), then half of 17 rounded up (9).
    expect(life(game, B)).toBe(8);
  });
});
