/**
 * One-shot permissions on graveyard cards, and what an escape carries: escape as a
 * `grant-graveyard-keyword` (rule 702.138a), "escapes with your choice of" a counter
 * (702.138c) and "escapes with [ability]" (702.138d) with the cards its escape exiled
 * linked to it (607.2a); `grant-graveyard-cast`'s `free`, `exileAfter` and `filter`;
 * a `cast-now` from among cards milled this way.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** A cast from the graveyard by escape, naming who granted it and what it exiles. */
const escapeCast = (
  card: ObjectId,
  by: ObjectId,
  exile: readonly ObjectId[],
): Extract<Action, { type: "cast-spell" }> => ({
  type: "cast-spell",
  player: A,
  card,
  targets: [],
  via: "escape",
  graveyardGrant: { source: by },
  escapeExile: exile,
});

describe("escape as a one-shot grant (Desdemona, Freedom's Edge)", () => {
  function board() {
    const t = table();
    const { game, a } = t;
    const desdemona = spawn(game, "Desdemona, Freedom's Edge");
    const bears = toGraveyard(game, "Grizzly Bears");
    const one = toGraveyard(game, "Wastes");
    const two = toGraveyard(game, "Wastes");
    pickTargets(a, bears);
    return { ...t, desdemona, bears, one, two };
  }

  it("lets the card be cast for its mana cost plus two others exiled, this turn", () => {
    const { game, a, desdemona, bears, one, two } = board();
    lands(game, "Forest", 2);
    attack(game, a, [desdemona]);
    expect(game.canDispatch(escapeCast(bears, desdemona, [one, two]))).toBeNull();
    game.dispatch(escapeCast(bears, desdemona, [one, two]));
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
  });

  it("needs two other cards to exile", () => {
    const t = table();
    const { game, a } = t;
    const desdemona = spawn(game, "Desdemona, Freedom's Edge");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const one = toGraveyard(game, "Wastes");
    pickTargets(a, bears);
    attack(game, a, [desdemona]);
    expect(game.canDispatch(escapeCast(bears, desdemona, [one]))).not.toBeNull();
  });

  it("is gone next turn, and only reaches a creature with mana value 3 or less or an artifact one", () => {
    const { game, a, desdemona, bears, one, two } = board();
    lands(game, "Forest", 2);
    const giant = toGraveyard(game, "Hill Giant");
    const elves = toGraveyard(game, "Llanowar Elves");
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_v, _n, _s, options) => {
      offered = options[0];
      return [ref(bears)];
    };
    attack(game, a, [desdemona]);
    expect(offered).toContainEqual(ref(bears));
    expect(offered).toContainEqual(ref(elves));
    expect(offered).not.toContainEqual(ref(giant));
    nextTurn(game);
    nextTurn(game);
    expect(game.canDispatch(escapeCast(bears, desdemona, [one, two]))).not.toBeNull();
  });
});

describe("escape granted to every creature card as it resolves (The Grim Captain's Locker)", () => {
  it("costs {3}{B} and four others, and doesn't reach a card put there later", () => {
    const { game } = table();
    const locker = spawn(game, "The Grim Captain's Locker");
    lands(game, "Swamp", 4);
    const giant = toGraveyard(game, "Hill Giant");
    const others = [0, 1, 2, 3].map(() => toGraveyard(game, "Wastes"));
    activate(game, locker, 1);
    const later = toGraveyard(game, "Grizzly Bears");
    expect(game.canDispatch(escapeCast(later, locker, others))).not.toBeNull();
    expect(game.canDispatch(escapeCast(giant, locker, others))).toBeNull();
    cast(game, giant, { via: "escape", graveyardGrant: { source: locker }, escapeExile: others });
    expect(zone(game, giant)).toBe("battlefield");
    expect(graveyard(game, A)).toEqual([later]);
  });

  it("the Locker's other ability surveils", () => {
    const { game, a } = table();
    const locker = spawn(game, "The Grim Captain's Locker");
    const top = toLibrary(game, "Hill Giant");
    a.chooseScryFn = () => [top];
    activate(game, locker, 0);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Confession Dial", () => {
  it("surveils 3 on entering, and gives only a legendary creature card escape", () => {
    const { game, a } = table();
    toLibrary(game, "Wastes");
    const top = toLibrary(game, "Hill Giant");
    let looked = 0;
    a.chooseScryFn = (_v, cards) => {
      looked = cards.length;
      return [top];
    };
    const dial = enter(game, "Confession Dial");
    expect(looked).toBe(3);
    expect(zone(game, top)).toBe("graveyard");
    const ragavan = toGraveyard(game, "Isamaru, Hound of Konda");
    const other = toGraveyard(game, "Jodah, Archmage Eternal");
    const others = [0, 1, 2].map(() => toGraveyard(game, "Wastes"));
    lands(game, "Plains", 1);
    const refused = (target: ObjectId): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: dial, abilityIndex: 0, targets: [ref(target)] });
    expect(refused(other)).toBeNull();
    expect(refused(top)).not.toBeNull();
    activate(game, dial, 0, { targets: [ref(ragavan)] });
    cast(game, ragavan, { via: "escape", graveyardGrant: { source: dial }, escapeExile: others });
    expect(zone(game, ragavan)).toBe("battlefield");
  });
});

describe("escapes with your choice of counter (Tizerus Charger)", () => {
  function escaped(pick: string) {
    const t = table();
    const { game, a } = t;
    lands(game, "Swamp", 5);
    const charger = toGraveyard(game, "Tizerus Charger");
    const others = [0, 1, 2, 3, 4].map(() => toGraveyard(game, "Wastes"));
    a.chooseCreatureTypeFn = (_v, _source, options) => {
      expect(options).toEqual(["+1/+1", "flying"]);
      return pick;
    };
    cast(game, charger, { via: "escape", escapeExile: others });
    return { ...t, charger };
  }

  it("a +1/+1 counter", () => {
    const { game, charger } = escaped("+1/+1");
    expect(pt(game, charger)).toEqual({ power: 4, toughness: 3 });
    expect(counters(game, charger, "flying")).toBe(0);
  });

  it("a flying counter", () => {
    const { game, charger } = escaped("flying");
    expect(pt(game, charger)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, charger).has("flying")).toBe(true);
  });

  it("cast from hand, there's no choice and no counter", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    let asked = false;
    a.chooseCreatureTypeFn = () => {
      asked = true;
      return "flying";
    };
    const charger = toHand(game, "Tizerus Charger");
    cast(game, charger);
    expect(asked).toBe(false);
    expect(pt(game, charger)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("escapes with an ability, over the cards it exiled (Skyway Robber)", () => {
  function escaped() {
    const t = table();
    const { game } = t;
    lands(game, "Island", 4);
    const robber = toGraveyard(game, "Skyway Robber");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const rest = [0, 1, 2].map(() => toGraveyard(game, "Wastes"));
    cast(game, robber, { via: "escape", escapeExile: [bolt, bears, ...rest] });
    return { ...t, robber, bolt, bears };
  }

  it("casts an instant it exiled free on combat damage, but a creature it exiled isn't offered", () => {
    const { game, a, robber, bolt, bears } = escaped();
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [robber]);
    expect(offered).toEqual([bolt]);
    expect(offered).not.toContain(bears);
    expect(life(game, B)).toBe(20 - 3 - 3);
  });

  it("cast from hand it has no such ability, and a card exiled by something else isn't reached", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const robber = toHand(game, "Skyway Robber");
    cast(game, robber);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [robber]);
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("its link ends when it leaves and comes back (rule 400.7, the ruling)", () => {
    const { game, a, robber, bolt } = escaped();
    expect(game.state.objects[bolt].exiledWith?.source).toBe(robber);
    lands(game, "Island", 1);
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(robber)] });
    expect(zone(game, robber)).toBe("hand");
    cast(game, robber);
    game.state.objects[robber].summoningSick = false;
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [robber]);
    expect(asked).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("a free graveyard cast, exiled after (Sins of the Past)", () => {
  it("costs nothing, keeps its timing and exiles both", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const divination = toGraveyard(game, "Divination");
    pickTargets(a, divination);
    const sins = toHand(game, "Sins of the Past");
    cast(game, sins, { targets: [ref(divination)] });
    expect(zone(game, sins)).toBe("exile");
    expect(game.state.objects[divination].playPermission?.free).toBe(true);
    const before = hand(game).length;
    cast(game, divination, { via: "graveyard-permission", graveyardGrant: { source: divination } });
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("exile");
  });

  it("only this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const divination = toGraveyard(game, "Divination");
    cast(game, toHand(game, "Sins of the Past"), { targets: [ref(divination)] });
    nextTurn(game);
    nextTurn(game);
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: divination,
        targets: [],
        via: "graveyard-permission",
        graveyardGrant: { source: divination },
      }),
    ).not.toBeNull();
  });
});

describe("a graveyard cast granted to many (Case of the Uneaten Feast)", () => {
  it("once solved, gives the creature cards there for their cost, this turn only", () => {
    const { game } = table();
    const theCase = spawn(game, "Case of the Uneaten Feast");
    game.state.objects[theCase].solved = true;
    lands(game, "Forest", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    activate(game, theCase);
    expect(zone(game, theCase)).toBe("graveyard");
    const permission = (id: ObjectId) => game.state.objects[id].playPermission;
    expect(permission(bears)).toBeDefined();
    expect(permission(bears)?.free).toBeUndefined();
    expect(permission(bolt)).toBeUndefined();
    cast(game, bears, { via: "graveyard-permission", graveyardGrant: { source: bears } });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("unsolved can't be sacrificed, and five life gained solves it at your end step", () => {
    const { game } = table();
    const theCase = spawn(game, "Case of the Uneaten Feast");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: theCase, abilityIndex: 0, targets: [] })).not.toBeNull();
    for (let i = 0; i < 5; i += 1) enter(game, "Grizzly Bears");
    expect(life(game)).toBe(25);
    game.advanceUntil((s) => s.turn.step === "cleanup" || s.turn.number > 1);
    expect(game.state.objects[theCase].solved).toBe(true);
  });
});

describe("a cast from among the cards milled (Jace's Mindseeker)", () => {
  it("offers only the instants and sorceries among those milled, free", () => {
    const { game, a } = table();
    const earlier = toGraveyard(game, "Divination", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Wastes", B);
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    enter(game, "Jace's Mindseeker");
    expect(offered).toEqual([bolt]);
    expect(offered).not.toContain(earlier);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
