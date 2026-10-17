/**
 * Wilds of Eldraine, batch 1e: the bargain cards (rule 702.166). One test per
 * card, on its riskiest clause — usually what changes when it's bargained.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

/** A Clue token on alice's battlefield: something to bargain away. */
function clue(game: Game): ObjectId {
  const id = spawn(game, "Clue Token");
  game.state.objects[id].isToken = true;
  return id;
}

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).flatMap((l) => (l.kind === "cast-spell" && l.card === card ? [l] : []));

describe("WOE batch 1e — bargain", () => {
  it("Back for Seconds: bargained, one of the two with mana value 4 or less onto the battlefield, the other to hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    clue(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    const seen = pickFromZone(a, bears);
    cast(game, game.debugSpawn("Back for Seconds", A, "hand"), { targets: [ref(bears), ref(dreadmaw)], kicked: true });
    expect(seen.offered).toEqual([bears]); // the Dreadmaw's mana value is 6
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, dreadmaw)).toBe("hand");
  });

  it("Back for Seconds: bargained with nothing small enough, both still go to hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    clue(game);
    const big = [toGraveyard(game, "Colossal Dreadmaw"), toGraveyard(game, "Craw Wurm")];
    cast(game, game.debugSpawn("Back for Seconds", A, "hand"), { targets: big.map(ref), kicked: true });
    expect(big.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
  });

  it("Ice Out: unbargained, the full {1}{U}{U}, and it counters", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 3);
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, game.debugSpawn("Ice Out", A, "hand"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("Rowan's Grim Search: bargained, two kept on top and drawn, the other two milled, then 2 life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    clue(game);
    // Top of library, top first: d, c, b, a.
    const [w, x, y, z] = ["Grizzly Bears", "Hill Giant", "Craw Wurm", "Colossal Dreadmaw"]
      .reverse()
      .map((name) => toLibrary(game, name))
      .reverse();
    pickFromZone(a, y, w);
    cast(game, game.debugSpawn("Rowan's Grim Search", A, "hand"), { kicked: true });
    expect(hand(game)).toEqual(expect.arrayContaining([y, w]));
    expect(graveyard(game)).toEqual(expect.arrayContaining([x, z]));
    expect(life(game, A)).toBe(18);
  });

  it("Realm-Scorcher Hellkite: bargained, four mana on entering; unbargained, none", () => {
    const { game } = table();
    lands(game, "Mountain", 12);
    clue(game);
    cast(game, game.debugSpawn("Realm-Scorcher Hellkite", A, "hand"), { kicked: true });
    expect(game.state.players[A].manaPool).toHaveLength(4);
    game.state.players[A].manaPool = [];
    cast(game, game.debugSpawn("Realm-Scorcher Hellkite", A, "hand"));
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });

  it("Stonesplitter Bolt: bargained, twice X", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    clue(game);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    cast(game, game.debugSpawn("Stonesplitter Bolt", A, "hand"), { targets: [ref(wurm)], x: 2, kicked: true });
    expect(zone(game, wurm)).toBe("graveyard");
    const other = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 3);
    cast(game, game.debugSpawn("Stonesplitter Bolt", A, "hand"), { targets: [ref(other)], x: 2 });
    expect(game.state.objects[other].damageMarked).toBe(2);
  });

  it("Thunderous Debut: bargained, the revealed creatures onto the battlefield; unbargained, into the hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 16);
    clue(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant, bears);
    cast(game, game.debugSpawn("Thunderous Debut", A, "hand"), { kicked: true });
    expect([zone(game, bears), zone(game, giant)]).toEqual(["battlefield", "battlefield"]);
    const wurm = toLibrary(game, "Craw Wurm");
    pickFromZone(a, wurm);
    cast(game, game.debugSpawn("Thunderous Debut", A, "hand"));
    expect(zone(game, wurm)).toBe("hand");
  });

  it("Farsight Ritual: bargained, eight looked at, still only two taken", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    clue(game);
    const top = Array.from({ length: 9 }, () => toLibrary(game, "Grizzly Bears")).reverse();
    const seen = pickFromZone(a, top[6], top[7]);
    cast(game, game.debugSpawn("Farsight Ritual", A, "hand"), { kicked: true });
    expect(seen.offered).toHaveLength(8);
    expect(seen.offered).not.toContain(top[8]);
    expect(hand(game)).toEqual(expect.arrayContaining([top[6], top[7]]));
    expect(hand(game).filter((id) => top.includes(id))).toHaveLength(2);
  });

  it("Brave the Wilds: bargained, the targeted land becomes a 3/3 haste Elemental for good, and the search still happens", () => {
    const { game, a } = table();
    const [forest] = lands(game, "Forest", 1);
    clue(game);
    const wastes = game.state.zones.perPlayer[A].library[0];
    pickFromZone(a, wastes);
    cast(game, game.debugSpawn("Brave the Wilds", A, "hand"), { targets: [ref(forest)], kicked: true });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, forest).has("haste")).toBe(true);
    expect(zone(game, wastes)).toBe("hand");
    toStep(game, "precombat-main", B);
    expect(types(game, forest)).toContain("creature");
  });

  it("Candy Grapple: unbargained, -3/-3", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, game.debugSpawn("Candy Grapple", A, "hand"), { targets: [ref(dreadmaw)] });
    expect(pt(game, dreadmaw)).toEqual({ power: 3, toughness: 3 });
  });

  it("Archon's Glory: flying and lifelink only when bargained", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, game.debugSpawn("Archon's Glory", A, "hand"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(false);
    clue(game);
    cast(game, game.debugSpawn("Archon's Glory", A, "hand"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("High Fae Negotiator: bargained, each opponent loses 3 and you gain 3 once", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 5);
    clue(game);
    cast(game, game.debugSpawn("High Fae Negotiator", A, "hand"), { kicked: true });
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([23, 17, 17]);
  });

  it("Tenacious Tomeseeker: bargained, an instant back from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    clue(game);
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    cast(game, game.debugSpawn("Tenacious Tomeseeker", A, "hand"), { kicked: true });
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Troublemaker Ouphe: bargained, exiles an opponent's artifact; unbargained, nothing", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const stone = spawn(game, "Mind Stone", B);
    cast(game, game.debugSpawn("Troublemaker Ouphe", A, "hand"));
    expect(zone(game, stone)).toBe("battlefield");
    clue(game);
    pickTargets(a, stone);
    cast(game, game.debugSpawn("Troublemaker Ouphe", A, "hand"), { kicked: true });
    expect(zone(game, stone)).toBe("exile");
  });

  it("Johann's Stopgap: {2} less bargained — two lands and a Clue cast it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    clue(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const stopgap = game.debugSpawn("Johann's Stopgap", A, "hand");
    expect(offers(game, stopgap).map((o) => o.kicked === true)).toEqual([true]);
    const before = hand(game).length;
    cast(game, stopgap, { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before); // the Stopgap left, a card was drawn
  });

  it("Kellan's Lightblades: bargained, destroys the attacker rather than dealing 3", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    clue(game);
    const wurm = spawn(game, "Craw Wurm"); // 6/4: 3 damage wouldn't do it
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, game.debugSpawn("Kellan's Lightblades", A, "hand"), { targets: [ref(wurm)], kicked: true });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Hamlet Glutton: {2} less bargained; 3 life on entering", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const glutton = game.debugSpawn("Hamlet Glutton", A, "hand");
    expect(offers(game, glutton)).toHaveLength(0);
    clue(game);
    expect(offers(game, glutton).map((o) => o.kicked === true)).toEqual([true]);
    cast(game, glutton, { kicked: true });
    expect(zone(game, glutton)).toBe("battlefield");
    expect(life(game, A)).toBe(23);
  });

  it("Agatha's Champion: bargained, fights up to one creature you don't control", () => {
    const { game, a } = table();
    lands(game, "Forest", 10);
    clue(game);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const champion = game.debugSpawn("Agatha's Champion", A, "hand");
    cast(game, champion, { kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[champion].damageMarked).toBe(2);
    // Unbargained, no fight at all.
    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, other);
    cast(game, game.debugSpawn("Agatha's Champion", A, "hand"));
    expect(zone(game, other)).toBe("battlefield");
    settle(game);
  });
});
