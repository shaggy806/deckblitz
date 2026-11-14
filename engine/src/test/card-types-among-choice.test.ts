/**
 * Choosing graveyard cards by how many card types they have among them
 * (rule 205.2a — each type once however many cards have it), the zone
 * choice's `"variety"` rule: Nethergoyf's escape cost, "exile any number of
 * other cards from your graveyard with four or more card types among them"
 * (`escape.exileTypesAmong`, paid once the spell is on the stack — rule
 * 601.2h), and Winter, Cynical Opportunist's "you may exile any number of
 * cards from your graveyard with four or more card types among them"
 * (`SearchTogether`'s `cardTypesAmongAtLeast`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { completeTogether, fitsTogether, type ZoneChoiceTogether } from "../zone-choice-together.js";
import { A, B, cast, counters, lands, pt, settle, spawn, table, toGraveyard, toStep, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
const escapeOffers = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card && a.via === "escape");

describe("Nethergoyf", () => {
  it("counts the card types among cards in its owner's graveyard alone", () => {
    const { game } = table();
    const goyf = spawn(game, "Nethergoyf");
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Dryad Arbor");
    toGraveyard(game, "Lightning Bolt", B);
    // Creature and land: Dryad Arbor's creature type is counted once.
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
  });

  it("escapes only while the other cards in the graveyard hold four card types", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const goyf = toGraveyard(game, "Nethergoyf");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    // Nethergoyf's own creature type isn't another card's.
    expect(escapeOffers(game, goyf)).toHaveLength(0);
    toGraveyard(game, "Sol Ring");
    const offers = escapeOffers(game, goyf);
    expect(offers).toHaveLength(1);
    // Which cards is asked as the cost is paid, not with the cast.
    expect(offers[0].escapeExile).toBeUndefined();
  });

  it("asks for any number of other cards with four or more card types among them, and exiles those", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const goyf = toGraveyard(game, "Nethergoyf");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bears2 = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const ring = toGraveyard(game, "Sol Ring");
    const anthem = toGraveyard(game, "Glorious Anthem");
    let rule: ZoneChoiceTogether | undefined;
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (view, eligible) => {
      offered = eligible;
      const awaiting = view.state.awaiting;
      rule = awaiting?.kind === "choose-from-zone" ? awaiting.together : undefined;
      // A card adding no new type is allowed too (any number).
      return [bears, bears2, bolt, divination, ring];
    };
    cast(game, goyf, { via: "escape" });
    expect(offered).toEqual(expect.arrayContaining([bears, bears2, bolt, divination, ring, anthem]));
    expect(rule?.rule).toBe("variety");
    expect(fitsTogether(rule!, [bears, bears2, bolt, divination])).toBe(false);
    expect(fitsTogether(rule!, [])).toBe(false);
    expect(zone(game, goyf)).toBe("battlefield");
    for (const id of [bears, bears2, bolt, divination, ring]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, anthem)).toBe("graveyard");
    // Only Glorious Anthem is left: one card type.
    expect(pt(game, goyf)).toEqual({ power: 1, toughness: 2 });
  });

  it("refuses an answer with three card types among them", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const goyf = toGraveyard(game, "Nethergoyf");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const ring = toGraveyard(game, "Sol Ring");
    cast(game, goyf, { via: "escape", settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bears, bolt, divination] })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [] })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bears, bolt, divination, ring] })).toBeNull();
  });
});

describe("Winter, Cynical Opportunist", () => {
  it("exiles cards with four card types among them and puts a permanent card from among them onto the battlefield with a finality counter", () => {
    const { game, a } = table();
    spawn(game, "Winter, Cynical Opportunist");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const ring = toGraveyard(game, "Sol Ring");
    const anthem = toGraveyard(game, "Glorious Anthem");
    const asked: { eligible: readonly ObjectId[]; rule: ZoneChoiceTogether | undefined }[] = [];
    a.chooseFromZoneFn = (view, eligible) => {
      const awaiting = view.state.awaiting;
      asked.push({ eligible, rule: awaiting?.kind === "choose-from-zone" ? awaiting.together : undefined });
      return asked.length === 1 ? [bears, bolt, divination, ring] : [bears];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toHaveLength(2);
    expect(asked[0].rule?.rule).toBe("variety");
    // None is an answer too: "you may".
    expect(fitsTogether(asked[0].rule!, [])).toBe(true);
    expect(fitsTogether(asked[0].rule!, [bears, bolt, divination])).toBe(false);
    // Only the permanent cards exiled this way.
    expect([...asked[1].eligible].sort()).toEqual([bears, ring].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
    for (const id of [bolt, divination, ring]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, anthem)).toBe("graveyard");
  });

  it("choosing none exiles nothing and puts nothing onto the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Winter, Cynical Opportunist");
    const cards = ["Grizzly Bears", "Lightning Bolt", "Divination", "Sol Ring"].map((name) => toGraveyard(game, name));
    let calls = 0;
    a.chooseFromZoneFn = () => {
      calls += 1;
      return [];
    };
    toStep(game, "end");
    settle(game);
    expect(calls).toBe(1);
    for (const id of cards) expect(zone(game, id)).toBe("graveyard");
  });

  it("a set short of four card types is refused before it's dispatched", () => {
    const { game } = table();
    spawn(game, "Winter, Cynical Opportunist");
    const [bears, bolt, divination, ring] = ["Grizzly Bears", "Lightning Bolt", "Divination", "Sol Ring"].map((name) =>
      toGraveyard(game, name),
    );
    toStep(game, "end");
    game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bears, bolt, divination] })).toMatch(
      /four or more card types/,
    );
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [] })).toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bears, bolt, divination, ring] })).toBeNull();
  });

  it("with fewer than four card types in the graveyard, nothing is asked", () => {
    const { game, a } = table();
    spawn(game, "Winter, Cynical Opportunist");
    const cards = ["Grizzly Bears", "Lightning Bolt", "Divination"].map((name) => toGraveyard(game, name));
    let calls = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      calls += 1;
      return [...eligible];
    };
    toStep(game, "end");
    settle(game);
    expect(calls).toBe(0);
    for (const id of cards) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("completing a pick under the variety rule", () => {
  const short: ZoneChoiceTogether = {
    rule: "variety",
    tags: { a: ["creature"], b: ["instant"], c: ["sorcery"] },
    atLeast: 4,
    text: "with four or more card types among them",
  };
  const ids = ["a", "b", "c"] as unknown as ObjectId[];

  it("where none is an answer and every card together falls short, it's none", () => {
    // A random pick of one card ("any number"), completed: never all three,
    // which the rule refuses.
    expect(completeTogether({ ...short, orNone: true }, [ids[0]], ids, 0, 99)).toEqual([]);
  });

  it("enough types among the eligible cards: the pick grows until it fits", () => {
    const four: ZoneChoiceTogether = { ...short, tags: { ...short.tags, d: ["land"] }, orNone: true };
    const all = [...ids, "d" as unknown as ObjectId];
    const done = completeTogether(four, [all[1]], all, 0, 99);
    expect(fitsTogether(four, done)).toBe(true);
  });
});
