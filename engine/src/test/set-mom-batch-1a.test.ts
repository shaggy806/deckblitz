/**
 * March of the Machine (MOM), batch 1, part a (2026-10-17).
 * Written on the shared table in `harness.ts`, each test from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(
    game.state.objects[id].controller,
    { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
    [ref(id)],
  );

const incubators = (game: Game): ObjectId[] => named(game, "Incubator Token", A);

/** What alice is offered to sacrifice for `source`'s first ability. */
const sacrificeChoices = (game: Game, source: ObjectId): readonly ObjectId[] => {
  const offer = game
    .legalActions(A)
    .find((o) => o.kind === "activate-ability" && o.source === source && o.abilityIndex === 0);
  return offer?.kind === "activate-ability" ? (offer.sacrifice?.choices ?? []) : [];
};

/** Alice activates `source`'s first ability, sacrificing `victim` — settled. */
const sacrificeFor = (game: Game, source: ObjectId, victim: ObjectId): void => {
  const action = { type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], sacrifice: victim } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

describe("Furnace Gremlin", () => {
  it("incubates X equal to its power as it last existed, pumps included", () => {
    const { game } = table();
    const gremlin = spawn(game, "Furnace Gremlin");
    lands(game, "Mountain", 4);
    activate(game, gremlin);
    activate(game, gremlin);
    expect(pt(game, gremlin).power).toBe(3);
    destroy(game, gremlin);
    const made = incubators(game);
    expect(made).toHaveLength(1);
    expect(counters(game, made[0])).toBe(3);
  });
});

describe("Bloated Processor", () => {
  it("grows by sacrificing another Phyrexian, and incubates its power when it dies", () => {
    const { game } = table();
    const processor = spawn(game, "Bloated Processor");
    const gremlin = spawn(game, "Furnace Gremlin");
    spawn(game, "Grizzly Bears");
    expect(sacrificeChoices(game, processor)).toEqual([gremlin]);
    sacrificeFor(game, processor, gremlin);
    expect(zone(game, gremlin)).toBe("graveyard");
    expect(counters(game, processor)).toBe(1);
    // The gremlin's own death trigger incubated 1.
    expect(incubators(game).map((id) => counters(game, id))).toEqual([1]);
    destroy(game, processor);
    expect(incubators(game).map((id) => counters(game, id)).sort()).toEqual([1, 4]);
  });

  it("can't sacrifice itself or a non-Phyrexian", () => {
    const { game } = table();
    const processor = spawn(game, "Bloated Processor");
    const bears = spawn(game, "Grizzly Bears");
    expect(sacrificeChoices(game, processor)).toEqual([]);
    expect(() => sacrificeFor(game, processor, processor)).toThrow();
    expect(() => sacrificeFor(game, processor, bears)).toThrow();
  });
});

describe("Enduring Bondwarden", () => {
  it("backup grants the dies trigger, which puts every kind of counter the creature had", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    const warden = enter(game, "Enduring Bondwarden");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, warden)).toBe(0);
    game.state.objects[bears].counters.charge = 2;
    pickTargets(a, giant);
    destroy(game, bears);
    // The same number of each kind, not only +1/+1 counters.
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, giant, "charge")).toBe(2);
  });

  it("on itself only gets the counter, and its own death passes its counters on", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    // Backup targets the Bondwarden itself.
    a.chooseTargetsFn = (_v, _s, _specs, options) =>
      options.map(
        (slot) =>
          slot.find((t) => t.kind === "object" && game.state.objects[t.object]?.cardName === "Enduring Bondwarden") ?? null,
      );
    const warden = enter(game, "Enduring Bondwarden");
    expect(counters(game, warden)).toBe(1);
    expect(counters(game, giant)).toBe(0);
    pickTargets(a, giant);
    destroy(game, warden);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Essence of Orthodoxy", () => {
  it("incubates 2 for itself and another Phyrexian, not for a non-Phyrexian", () => {
    const { game } = table();
    enter(game, "Essence of Orthodoxy");
    expect(incubators(game).map((id) => counters(game, id))).toEqual([2]);
    enter(game, "Grizzly Bears");
    expect(incubators(game)).toHaveLength(1);
    enter(game, "Furnace Gremlin");
    expect(incubators(game)).toHaveLength(2);
    enter(game, "Furnace Gremlin", B);
    expect(incubators(game)).toHaveLength(2);
  });
});

describe("Sculpted Perfection and Tangled Skyline", () => {
  it("pumps and gives reach to Phyrexians you control only", () => {
    const { game } = table();
    enter(game, "Sculpted Perfection");
    enter(game, "Tangled Skyline");
    expect(life(game)).toBe(25);
    expect(incubators(game).map((id) => counters(game, id)).sort()).toEqual([2, 5]);
    const gremlin = spawn(game, "Furnace Gremlin");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Furnace Gremlin", B);
    expect(pt(game, gremlin)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, gremlin).has("reach")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("reach")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
    // An Incubator turned over is a Phyrexian.
    const [five] = incubators(game).filter((id) => counters(game, id) === 5);
    lands(game, "Forest", 2);
    activate(game, five);
    expect(pt(game, five)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, five).has("reach")).toBe(true);
  });
});

describe("Grafted Butcher", () => {
  it("gives Phyrexians menace as it enters and pumps only the others", () => {
    const { game } = table();
    const gremlin = spawn(game, "Furnace Gremlin");
    const bears = spawn(game, "Grizzly Bears");
    const butcher = enter(game, "Grafted Butcher");
    expect(keywords(game, gremlin).has("menace")).toBe(true);
    expect(keywords(game, butcher).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
    expect(pt(game, butcher)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, gremlin)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("returns itself from the graveyard by sacrificing an artifact or creature, at sorcery speed", () => {
    const { game } = table();
    const butcher = toGraveyard(game, "Grafted Butcher");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Swamp", 4);
    expect(sacrificeChoices(game, butcher)).toEqual([ring]);
    sacrificeFor(game, butcher, ring);
    expect(zone(game, butcher)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Deluxe Dragster", () => {
  it("can be blocked only by Vehicles", () => {
    const { game, a } = table();
    const dragster = spawn(game, "Deluxe Dragster");
    crewed(game, dragster);
    const bears = spawn(game, "Grizzly Bears", B);
    const theirs = spawn(game, "Deluxe Dragster", B);
    crewed(game, theirs);
    toStep(game, "begin-combat");
    const offer = blockOffer(game, a, [dragster]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(bears)).toEqual([]);
    expect(canBlock(theirs)).toEqual([dragster]);
  });

  it("casts an instant from the damaged player's graveyard for free, then exiles it", () => {
    const { game, a } = table();
    const dragster = spawn(game, "Deluxe Dragster");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    toStep(game, "begin-combat");
    crewed(game, dragster);
    attack(game, a, [dragster]);
    settle(game);
    expect(offered).toBe(true);
    expect(life(game, B)).toBe(20 - 4 - 3);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("Errant and Giada", () => {
  it("casts a spell with flying from the top of the library, but not one without flash or flying", () => {
    const { game } = table();
    spawn(game, "Errant and Giada");
    lands(game, "Plains", 5);
    const bears = toLibrary(game, "Grizzly Bears");
    const castable = (id: ObjectId): boolean =>
      game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === id);
    expect(castable(bears)).toBe(false);
    const angel = toLibrary(game, "Serra Angel");
    expect(castable(angel)).toBe(true);
    cast(game, angel, { via: "library-top" });
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("casts a flash spell from the top at instant speed", () => {
    const { game } = table();
    spawn(game, "Errant and Giada");
    lands(game, "Forest", 4);
    toStep(game, "end");
    // A flying creature off the top keeps its own (sorcery) timing.
    const angel = toLibrary(game, "Serra Angel");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === angel)).toBe(false);
    const flash = toLibrary(game, "Briarpack Alpha");
    cast(game, flash, { via: "library-top" });
    expect(zone(game, flash)).toBe("battlefield");
  });
});

describe("Katilda and Lier", () => {
  it("casting a Human spell gives an instant in your graveyard flashback for its mana cost", () => {
    const { game, a } = table();
    spawn(game, "Katilda and Lier");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    pickTargets(a, bolt);
    cast(game, toHand(game, "Elite Vanguard"));
    cast(game, bolt, { targets: [ref(B)], via: "flashback" });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("doesn't trigger on a non-Human spell", () => {
    const { game, a } = table();
    spawn(game, "Katilda and Lier");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Forest", 3);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(bolt)];
    };
    cast(game, toHand(game, "Grizzly Bears"));
    expect(asked).toBe(0);
    expect(() => cast(game, bolt, { targets: [ref(B)], via: "flashback" })).toThrow();
  });
});

describe("Storm the Seedcore", () => {
  it("distributes four counters as cast, and every creature you control gains vigilance and trample", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Storm the Seedcore"), { targets: [ref(bears), ref(giant)], division: [3, 1] });
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, giant)).toBe(1);
    expect(keywords(game, elves).has("vigilance")).toBe(true);
    expect(keywords(game, elves).has("trample")).toBe(true);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Chrome Host Hulk", () => {
  it("makes up to one other creature base 5/5 until end of turn, counters still counting", () => {
    const { game, a } = table();
    const hermit = spawn(game, "Gnottvold Hermit");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    lands(game, "Island", 6);
    activate(game, hermit);
    expect(game.state.objects[hermit].face).toBe(1);
    expect(pt(game, hermit)).toEqual({ power: 5, toughness: 5 });
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    a.declareAttackersFn = () => [{ attacker: hermit, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    toStep(game, "precombat-main", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Furnace-Blessed Conqueror", () => {
  it("makes a tapped, attacking copy with its +1/+1 counters, sacrificed at the next end step", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Sun-Blessed Guardian");
    lands(game, "Mountain", 6);
    activate(game, guardian);
    expect(game.state.objects[guardian].face).toBe(1);
    game.state.objects[guardian].counters["+1/+1"] = 2;
    toStep(game, "begin-combat");
    attack(game, a, [guardian]);
    // The original 5/5 and its 3/3 copy with two counters: 10 damage.
    expect(life(game, B)).toBe(10);
    expect(tokensNamed(game, "Furnace-Blessed Conqueror", A)).toBe(1);
    const [token] = named(game, "Furnace-Blessed Conqueror").filter((id) => game.state.objects[id].isToken);
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
    expect(game.state.objects[token].tapped).toBe(true);
    // Never declared, so the copy's own attack ability didn't trigger: one token.
    toStep(game, "precombat-main", B);
    expect(tokensNamed(game, "Furnace-Blessed Conqueror", A)).toBe(0);
    expect(graveyard(game, A)).not.toContain(token);
  });
});

describe("Alabaster Host Intercessor", () => {
  it("exiles an opponent's creature until it leaves the battlefield", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    const host = enter(game, "Alabaster Host Intercessor");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, host);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});
