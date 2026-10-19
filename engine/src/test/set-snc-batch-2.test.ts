/**
 * Streets of New Capenna — the shield counter cards (rule 122.1c, `shield-counters.test.ts`).
 */
import { describe, expect, it } from "vitest";

import { legalTargets } from "../targeting.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("cards that enter with a shield counter", () => {
  it("Disciplined Duelist, Swooping Protector, Dapper Shieldmate, Rhox Pummeler, Wingshield Agent, Voice of the Vermin and Rigo", () => {
    const { game } = table();
    for (const name of [
      "Disciplined Duelist",
      "Swooping Protector",
      "Dapper Shieldmate",
      "Rhox Pummeler",
      "Wingshield Agent",
      "Voice of the Vermin",
      "Rigo, Streetwise Mentor",
    ]) {
      expect(counters(game, enter(game, name), "shield")).toBe(1);
    }
  });
});

describe("Rhox Pummeler", () => {
  it("has trample only while it has a shield counter", () => {
    const { game } = table();
    const rhox = enter(game, "Rhox Pummeler");
    expect(keywords(game, rhox).has("trample")).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(rhox)] });
    expect(zone(game, rhox)).toBe("battlefield");
    expect(keywords(game, rhox).has("trample")).toBe(false);
  });
});

describe("Dapper Shieldmate", () => {
  it("gets +2/+0 during your turn only", () => {
    const { game } = table();
    const mate = enter(game, "Dapper Shieldmate");
    expect(pt(game, mate).power).toBe(4);
    toStep(game, "upkeep", B);
    expect(pt(game, mate).power).toBe(2);
  });
});

describe("Brokers Veteran", () => {
  it("dying puts a shield counter on target creature you control", () => {
    const { game } = table();
    const veteran = spawn(game, "Brokers Veteran");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(veteran)] });
    expect(zone(game, veteran)).toBe("graveyard");
    expect(counters(game, bears, "shield")).toBe(1);
  });
});

describe("Wingshield Agent and Voice of the Vermin", () => {
  it("attacking: another creature gains flying; a creature you control becomes a 4/4", () => {
    const { game, a } = table();
    const agent = spawn(game, "Wingshield Agent");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [agent]);
    expect(keywords(game, bears).has("flying")).toBe(true);

    const { game: g2, a: a2 } = table();
    const voice = spawn(g2, "Voice of the Vermin");
    attack(g2, a2, [voice]);
    expect(pt(g2, voice)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Rigo, Streetwise Mentor", () => {
  it("draws when you attack with a creature of power 1 or less, not a bigger one", () => {
    const { game, a } = table();
    spawn(game, "Rigo, Streetwise Mentor");
    const elf = spawn(game, "Llanowar Elves");
    const before = hand(game).length;
    attack(game, a, [elf]);
    expect(hand(game).length).toBe(before + 1);

    const { game: g2, a: a2 } = table();
    spawn(g2, "Rigo, Streetwise Mentor");
    const bears = spawn(g2, "Grizzly Bears");
    const before2 = hand(g2).length;
    attack(g2, a2, [bears]);
    expect(hand(g2).length).toBe(before2);
  });
});

describe("Family's Favor", () => {
  it("shields an attacker, which trades the counter for a card when it connects", () => {
    const { game, a } = table();
    spawn(game, "Family's Favor");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(counters(game, bears, "shield")).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Agent's Toolkit", () => {
  it("enters with four counters and moves one of a chosen kind onto a creature that enters", () => {
    const { game, a } = table();
    const kit = enter(game, "Agent's Toolkit");
    for (const kind of ["+1/+1", "flying", "deathtouch", "shield"]) expect(counters(game, kit, kind)).toBe(1);
    // The "you may" and then the kind to move: answer flying where offered.
    a.chooseModesFn = (_view, _min, _max, texts) => {
      const i = texts.findIndex((t) => /flying/i.test(t));
      return [i < 0 ? 0 : i];
    };
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears, "flying")).toBe(1);
    expect(counters(game, kit, "flying")).toBe(0);
  });
});

// Older cards shield counters unblocked (B20–B90 and the commander pass).

describe("Boon of Safety and Protection Magic", () => {
  it("put shield counters: one and scry, or on up to three targets", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const z = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Boon of Safety"), { targets: [ref(x)] });
    expect(counters(game, x, "shield")).toBe(1);
    cast(game, toHand(game, "Protection Magic"), { targets: [ref(x), ref(y), ref(z)] });
    expect([x, y, z].map((id) => counters(game, id, "shield"))).toEqual([2, 1, 1]);
  });
});

describe("Proud Pack-Rhino, Brotherhood Outcast and Titan of Industry", () => {
  it("Pack-Rhino: a shield counter on target permanent", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest");
    pickModes(a, 0);
    pickTargets(a, land);
    enter(game, "Proud Pack-Rhino");
    expect(counters(game, land, "shield")).toBe(1);
  });

  it("Outcast: returns an Equipment with mana value 3 or less from your graveyard", () => {
    const { game, a } = table();
    const splitter = toGraveyard(game, "Bonesplitter");
    pickModes(a, 0);
    pickTargets(a, splitter);
    enter(game, "Brotherhood Outcast");
    expect(zone(game, splitter)).toBe("battlefield");
  });

  it("Titan: two modes — a Rhino Warrior and a shield counter on a creature you choose", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    // A mode with no legal target isn't offered, so pick by text.
    a.chooseModesFn = (_view, _min, _max, texts) =>
      texts.flatMap((t, i) => (/Rhino Warrior|shield counter/.test(t) ? [i] : []));
    pickPermanents(a, bears);
    enter(game, "Titan of Industry");
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(1);
    expect(counters(game, bears, "shield")).toBe(1);
  });
});

describe("Diamond City", () => {
  it("moves its shield counter only once two creatures entered under your control this turn", () => {
    const { game } = table();
    const city = enter(game, "Diamond City");
    expect(counters(game, city, "shield")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, city, 1, { targets: [ref(bears)] })).toThrow();
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    activate(game, city, 1, { targets: [ref(bears)] });
    expect(counters(game, bears, "shield")).toBe(1);
    expect(counters(game, city, "shield")).toBe(0);
  });
});

describe("Captain America, Super-Soldier", () => {
  it("gives you hexproof while he has a shield counter", () => {
    const { game } = table();
    const cap = enter(game, "Captain America, Super-Soldier");
    expect(counters(game, cap, "shield")).toBe(1);
    const targetable = (): boolean =>
      legalTargets(game.state, registryOf(game), "player", B).some((t) => t.kind === "player" && t.player === A);
    expect(targetable()).toBe(false);
    game.state.objects[cap].counters = {};
    expect(targetable()).toBe(true);
  });
});
