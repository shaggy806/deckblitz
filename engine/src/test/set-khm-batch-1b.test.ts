/**
 * The set walk, Kaldheim batch 1, part b (2026-10-20): Crown of Skemfar,
 * Firja, Smashing Success, Withercrown, Cleaving Reaper, Master Skald,
 * Dwarven Hammer, Tormentor's Helm, Bretagard Stronghold, Gilded Assault Cart
 * and Demonic Gifts — the clause of each most likely to be wrong. Written on
 * the shared table in `harness.ts`.
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
  graveyard,
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
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Crown of Skemfar", () => {
  it("gives +1/+1 for each Elf its controller controls, live, and reach", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    lands(game, "Forest", 2);
    lands(game, "Wastes", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Crown of Skemfar"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    spawn(game, "Llanowar Elves");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("returns from the graveyard to its owner's hand for {2}{G}", () => {
    const { game } = table();
    const crown = toGraveyard(game, "Crown of Skemfar");
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    activate(game, crown, 0);
    expect(zone(game, crown)).toBe("hand");
  });
});

describe("Firja, Judge of Valor", () => {
  it("triggers on the second spell only: one of the top three to hand, the rest to the graveyard", () => {
    const { game } = table();
    spawn(game, "Firja, Judge of Valor");
    const first = toHand(game, "Ornithopter");
    const second = toHand(game, "Ornithopter");
    const third = toHand(game, "Ornithopter");
    cast(game, first);
    expect(graveyard(game).length).toBe(0);
    const before = hand(game).length;
    cast(game, second);
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(graveyard(game).length).toBe(2);
    cast(game, third);
    expect(graveyard(game).length).toBe(2);
  });
});

describe("Smashing Success", () => {
  it("makes a Treasure for a destroyed artifact, not for a land", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Wastes", B);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 6);
    cast(game, toHand(game, "Smashing Success"), { targets: [ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    cast(game, toHand(game, "Smashing Success"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Withercrown", () => {
  it("sets base power 0 under counters; at upkeep, decline to sacrifice and lose 1 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Withercrown"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 3 });
    pickModes(a);
    toStep(game, "draw");
    expect(life(game)).toBe(19);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("sacrificing the creature spares the life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Withercrown"), { targets: [ref(bears)] });
    pickModes(a, 0);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });
});

describe("Cleaving Reaper", () => {
  it("returns for 3 life only once an Angel or Berserker entered under your control this turn", () => {
    const { game } = table();
    const reaper = toGraveyard(game, "Cleaving Reaper");
    enter(game, "Serra Angel", B);
    expect(() => activate(game, reaper, 0)).toThrow();
    enter(game, "Serra Angel");
    activate(game, reaper, 0);
    expect(zone(game, reaper)).toBe("hand");
    expect(life(game)).toBe(17);
  });
});

describe("Master Skald", () => {
  it("exiles a creature card to return the targeted artifact or enchantment card", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    pickTargets(a, ring);
    pickModes(a, 0);
    pickFromZone(a, bears);
    enter(game, "Master Skald");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, ring)).toBe("hand");
  });

  it("returns nothing when no creature card is exiled", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    pickTargets(a, ring);
    pickModes(a, 0);
    enter(game, "Master Skald");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Dwarven Hammer", () => {
  it("for {2}, makes a 2/1 Dwarf Berserker and attaches itself to it", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const hammer = enter(game, "Dwarven Hammer");
    const [token] = named(game, "Dwarf Berserker Token");
    expect(token).toBeDefined();
    expect(game.state.objects[hammer].attachedTo).toBe(token);
    expect(pt(game, token)).toEqual({ power: 5, toughness: 1 });
    expect(keywords(game, token).has("trample")).toBe(true);
  });
});

describe("Tormentor's Helm", () => {
  it("deals 1 damage to the defending player when the equipped creature becomes blocked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const helm = spawn(game, "Tormentor's Helm");
    lands(game, "Wastes", 1);
    activate(game, helm, 0, { targets: [ref(bears)] });
    const wall = spawn(game, "Grizzly Bears", B);
    const wall2 = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: wall, attacker: bears },
      { blocker: wall2, attacker: bears },
    ];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Bretagard Stronghold", () => {
  it("puts a +1/+1 counter on each of two creatures and gives them vigilance and lifelink", () => {
    const { game } = table();
    // It enters tapped (its own replacement); untap it to activate it.
    const land = spawn(game, "Bretagard Stronghold");
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(land)]);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    activate(game, land, 1, { targets: [ref(x), ref(y)] });
    expect(zone(game, land)).toBe("graveyard");
    for (const id of [x, y]) {
      expect(counters(game, id)).toBe(1);
      expect(keywords(game, id).has("vigilance")).toBe(true);
      expect(keywords(game, id).has("lifelink")).toBe(true);
    }
  });
});

describe("Gilded Assault Cart", () => {
  it("returns from the graveyard by sacrificing two Treasures", () => {
    const { game } = table();
    const cart = toGraveyard(game, "Gilded Assault Cart");
    spawn(game, "Treasure Token");
    spawn(game, "Treasure Token");
    activate(game, cart, 1);
    expect(zone(game, cart)).toBe("hand");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Demonic Gifts", () => {
  it("returns the creature once, untapped, and the returned one doesn't come back again", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const [bears] = named(game, "Grizzly Bears");
    cast(game, toHand(game, "Demonic Gifts"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, bears);
    settle(game);
    const [back] = named(game, "Grizzly Bears");
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(false);
    destroy(game, back);
    expect(named(game, "Grizzly Bears")).toEqual([]);
  });
});
