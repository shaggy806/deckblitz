/**
 * Set walk batch 84, part e (2026-10-15): Aetherdrift (DFT), Aetherdrift Commander (DRC) and Foundations (FDN), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

/** Fill `player`'s graveyard with `n` Wastes. */
const fillGraveyard = (game: Game, n: number, player: PlayerId = A): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, "Wastes", player);
};

describe("Gutless Plunderer", () => {
  it("raid: after you attacked, look at three, keep one on top and mill the rest", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    attack(game, a, [attacker]);
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Lightning Bolt");
    const top = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, second);
    enter(game, "Gutless Plunderer");
    expect([...seen.offered].sort()).toEqual([top, second, third].sort());
    expect(game.state.zones.perPlayer[A].library[0]).toBe(second);
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
  });

  it("does nothing if you haven't attacked this turn", () => {
    const { game } = table();
    const top = toLibrary(game, "Grizzly Bears");
    enter(game, "Gutless Plunderer");
    expect(zone(game, top)).toBe("library");
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Erudite Wizard", () => {
  it("gets a +1/+1 counter on your second draw of the turn, and only then", () => {
    const { game } = table();
    const wizard = spawn(game, "Erudite Wizard");
    // The turn's draw step already drew the first card.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, wizard)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, wizard)).toBe(1);
  });
});

describe("Infernal Vessel", () => {
  it("dies and returns as a Demon with two +1/+1 counters; as a Demon, it stays dead", () => {
    const { game } = table();
    const vessel = spawn(game, "Infernal Vessel");
    destroy(game, vessel);
    const [back] = named(game, "Infernal Vessel");
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(2);
    expect(pt(game, back)).toEqual({ power: 4, toughness: 3 });
    expect(subtypes(game, back)).toEqual(expect.arrayContaining(["Human", "Cleric", "Demon"]));
    destroy(game, back);
    expect(named(game, "Infernal Vessel")).toEqual([]);
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Cephalid Inkmage", () => {
  it("surveils 3 as it enters", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Grizzly Bears");
    const three = toLibrary(game, "Grizzly Bears");
    let looked: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards, mode) => {
      looked = mode === "surveil" ? cards : [];
      return [three, two];
    };
    enter(game, "Cephalid Inkmage");
    expect([...looked].sort()).toEqual([one, two, three].sort());
    expect(zone(game, three)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, one)).toBe("library");
  });

  it("can't be blocked only with threshold", () => {
    const { game } = table();
    const inkmage = spawn(game, "Cephalid Inkmage");
    fillGraveyard(game, 6);
    expect(keywords(game, inkmage).has("unblockable")).toBe(false);
    fillGraveyard(game, 1);
    expect(keywords(game, inkmage).has("unblockable")).toBe(true);
  });
});

describe("Ambush Wolf", () => {
  it("has flash, and exiles up to one target card from a graveyard", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Ambush Wolf");
    expect(zone(game, theirs)).toBe("exile");
    expect(keywords(game, named(game, "Ambush Wolf")[0]).has("flash")).toBe(true);
  });

  it("the target is optional", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Ambush Wolf");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Apothecary Stomper", () => {
  it("chooses two +1/+1 counters on a creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    const seen = watchTargets(a, (offered) => offered.map(() => bears));
    enter(game, "Apothecary Stomper");
    expect(seen.offered[0]).not.toContain(named(game, "Grizzly Bears", B)[0]);
    expect(counters(game, bears)).toBe(2);
  });

  it("or chooses 4 life", () => {
    const { game, a } = table();
    pickModes(a, 1);
    enter(game, "Apothecary Stomper");
    expect(life(game)).toBe(24);
  });
});

describe("Sun-Blessed Healer", () => {
  it("kicked, returns a nonland permanent card with mana value 2 or less from your graveyard", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const land = toGraveyard(game, "Plains");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const otherBears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Sun-Blessed Healer"), { kicked: true });
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, otherBears].sort());
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
  });

  it("unkicked, returns nothing", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Sun-Blessed Healer"));
    expect(named(game, "Sun-Blessed Healer").length).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Goblin Boarders", () => {
  it("enters with a +1/+1 counter only if you attacked this turn", () => {
    const { game, a } = table();
    const plain = enter(game, "Goblin Boarders");
    expect(counters(game, plain)).toBe(0);
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    const raided = enter(game, "Goblin Boarders");
    expect(counters(game, raided)).toBe(1);
    expect(pt(game, raided)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Courageous Goblin", () => {
  it("attacking while you control a power-4 creature, gets +1/+0 and menace", () => {
    const { game, a } = table();
    const big = spawn(game, "Grizzly Bears");
    game.state.objects[big].counters = { "+1/+1": 2 };
    const goblin = spawn(game, "Courageous Goblin");
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, goblin).has("menace")).toBe(true);
  });

  it("without one, doesn't", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    const goblin = spawn(game, "Courageous Goblin");
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, goblin).has("menace")).toBe(false);
  });
});

describe("Billowing Shriekmass", () => {
  it("mills three as it enters, and gets +2/+1 with threshold", () => {
    const { game } = table();
    fillGraveyard(game, 4);
    const shriekmass = enter(game, "Billowing Shriekmass");
    expect(graveyard(game).length).toBe(7);
    expect(pt(game, shriekmass)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, shriekmass).has("flying")).toBe(true);
  });

  it("is a 2/3 below seven cards", () => {
    const { game } = table();
    const shriekmass = enter(game, "Billowing Shriekmass");
    expect(graveyard(game).length).toBe(3);
    expect(pt(game, shriekmass)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Armasaur Guide", () => {
  it("attacking with three or more creatures, puts a +1/+1 counter on target creature you control", () => {
    const { game, a } = table();
    const guide = spawn(game, "Armasaur Guide");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    pickTargets(a, one);
    attack(game, a, [guide, one, two]);
    expect(counters(game, one)).toBe(1);
    expect(game.state.objects[guide].tapped).toBe(false);
  });

  it("not with two", () => {
    const { game, a } = table();
    const guide = spawn(game, "Armasaur Guide");
    const one = spawn(game, "Grizzly Bears");
    pickTargets(a, one);
    attack(game, a, [guide, one]);
    expect(counters(game, one)).toBe(0);
    expect(counters(game, guide)).toBe(0);
  });
});

describe("Guarded Heir", () => {
  it("creates two 3/3 white Knight tokens", () => {
    const { game } = table();
    const heir = enter(game, "Guarded Heir");
    expect(keywords(game, heir).has("lifelink")).toBe(true);
    expect(tokensNamed(game, "Knight Token (Guarded Heir)", A)).toBe(2);
    const [knight] = named(game, "Knight Token (Guarded Heir)");
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tragic Banshee", () => {
  it("gives an opponent's creature -1/-1 when nothing died this turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [giant]);
    enter(game, "Tragic Banshee");
    expect([...seen.offered[0]].sort()).toEqual([giant, theirBears].sort());
    expect(seen.offered[0]).not.toContain(mine);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });

  it("-13/-13 instead if a creature died this turn", () => {
    const { game, a } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Tragic Banshee");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Slumbering Cerberus", () => {
  it("doesn't untap in your untap step, but untaps at an end step after a creature died", () => {
    const { game } = table();
    const cerberus = spawn(game, "Slumbering Cerberus", A, { tapped: true });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(game.state.objects[cerberus].tapped).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[cerberus].tapped).toBe(true);
    nextTurn(game);
    destroy(game, spawn(game, "Grizzly Bears", B), A);
    toStep(game, "end", B);
    settle(game);
    expect(game.state.objects[cerberus].tapped).toBe(false);
  });
});

describe("Crypt Feaster", () => {
  it("attacking with threshold, gets +2/+0", () => {
    const { game, a } = table();
    fillGraveyard(game, 7);
    const feaster = spawn(game, "Crypt Feaster");
    a.declareAttackersFn = () => [{ attacker: feaster, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, feaster)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, feaster).has("menace")).toBe(true);
  });

  it("not below seven cards", () => {
    const { game, a } = table();
    fillGraveyard(game, 6);
    const feaster = spawn(game, "Crypt Feaster");
    a.declareAttackersFn = () => [{ attacker: feaster, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, feaster)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Strongbox Raider", () => {
  it("raid: exiles the top two, and only the chosen one may be played", () => {
    const { game, a } = table();
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    const first = toLibrary(game, "Lightning Bolt");
    const second = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, first);
    enter(game, "Strongbox Raider");
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    lands(game, "Mountain", 1);
    expect(canCast(game, first)).toBe(true);
    expect(canCast(game, second)).toBe(false);
  });

  it("does nothing if you haven't attacked this turn", () => {
    const { game } = table();
    const top = toLibrary(game, "Lightning Bolt");
    enter(game, "Strongbox Raider");
    expect(zone(game, top)).toBe("library");
  });
});

describe("Squad Rallier", () => {
  it("finds a creature card with power 2 or less among the top four", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const rallier = spawn(game, "Squad Rallier");
    const before = hand(game).length;
    const seen = pickFromZone(a, bears);
    activate(game, rallier);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3)).toEqual(expect.arrayContaining([giant, bolt]));
  });
});
