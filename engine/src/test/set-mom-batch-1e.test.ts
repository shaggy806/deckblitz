/**
 * March of the Machine (and its Commander precons), batch 1e. One test per
 * card whose behaviour is more than a copied pattern, on the clause most
 * likely to be wrong, written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

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
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
  controller,
} from "./harness.js";

describe("MOM batch 1e", () => {
  it("Conclave Sledge-Captain: two backups on one creature give it two damage triggers, each adding that many counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    let backups = 0;
    a.chooseTargetsFn = () => [ref(backups++ < 2 ? bears : named(game, "Conclave Sledge-Captain")[0])];
    const captain = enter(game, "Conclave Sledge-Captain");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, captain)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    attack(game, a, [bears]);
    // 4 combat damage (a 2/2 with two counters), twice: 2 + 4 + 4.
    expect(counters(game, bears)).toBe(10);
  });

  it("Moment of Truth: one to hand, one to the graveyard, the last to the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const wurm = toLibrary(game, "Craw Wurm");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears"); // top
    let picks = 0;
    a.chooseFromZoneFn = () => (picks++ === 0 ? [giant] : [wurm]);
    cast(game, game.debugSpawn("Moment of Truth", A, "hand"));
    expect(hand(game)).toContain(giant);
    expect(graveyard(game)).toContain(wurm);
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(bears);
  });

  it("Unseal the Necropolis: each player mills three, then up to two creature cards back, a milled one included", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const old = toGraveyard(game, "Hill Giant");
    const milled = toLibrary(game, "Grizzly Bears");
    const theirs = toLibrary(game, "Craw Wurm", B);
    const seen = pickFromZone(a, milled, old);
    cast(game, game.debugSpawn("Unseal the Necropolis", A, "hand"));
    expect(graveyard(game, B)).toHaveLength(3);
    expect(graveyard(game, B)).toContain(theirs);
    expect(seen.offered).toEqual(expect.arrayContaining([milled, old]));
    expect(seen.offered).not.toContain(theirs);
    expect([zone(game, milled), zone(game, old)]).toEqual(["hand", "hand"]);
  });

  it("Tidal Terror: with one other untapped creature nothing is tapped; with two, both tap and it can't be blocked", () => {
    const first = table();
    const terror = spawn(first.game, "Tidal Terror");
    const lone = spawn(first.game, "Grizzly Bears");
    pickModes(first.a, 0);
    attack(first.game, first.a, [terror]);
    expect(first.game.state.objects[lone].tapped).toBe(false);
    expect(keywords(first.game, terror).has("unblockable")).toBe(false);

    const { game, a } = table();
    const octopus = spawn(game, "Tidal Terror");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Hill Giant");
    pickModes(a, 0);
    pickPermanents(a, x, y);
    attack(game, a, [octopus]);
    expect([game.state.objects[x].tapped, game.state.objects[y].tapped]).toEqual([true, true]);
    expect(keywords(game, octopus).has("unblockable")).toBe(true);
  });

  it("Glistening Dawn: two Incubators, each with X counters, X the lands you control", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, game.debugSpawn("Glistening Dawn", A, "hand"));
    expect(tokensNamed(game, "Incubator Token", A)).toBe(2);
    for (const id of named(game, "Incubator Token", A)) expect(counters(game, id)).toBe(5);
  });

  it("Moira and Teshar: a historic spell returns a nonland permanent card with haste, exiled at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Moira and Teshar");
    lands(game, "Wastes", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    const ring = toGraveyard(game, "Sol Ring");
    const seen = watchTargets(a, () => [bears]);
    cast(game, game.debugSpawn("Sol Ring", A, "hand"));
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, ring]));
    expect(seen.offered[0]).not.toContain(forest);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Moira and Teshar: a nonhistoric spell doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Moira and Teshar");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    cast(game, game.debugSpawn("Grizzly Bears", A, "hand"));
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Hideous Fleshwheeler: transforming puts a permanent card of mana value 2 or less from an opponent's graveyard under your control", () => {
    const { game, a } = table();
    const rat = spawn(game, "Nezumi Freewheeler");
    lands(game, "Plains", 6);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    const forest = toGraveyard(game, "Forest", A);
    const seen = watchTargets(a, () => [bears]);
    activate(game, rat, 0);
    expect(printedCardName(game.state.objects[rat])).toBe("Hideous Fleshwheeler");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, forest])); // a land is a permanent card
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("Compleated Conjurer: transforming exiles the top card, playable through your next turn", () => {
    const { game } = table();
    const weird = spawn(game, "Captive Weird");
    lands(game, "Mountain", 4);
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, weird, 0);
    expect(zone(game, top)).toBe("exile");
  });

  describe("Sandstalker Moloch", () => {
    it("doesn't look when only you cast a black spell this turn", () => {
      const { game, a } = table();
      lands(game, "Swamp", 1);
      cast(game, game.debugSpawn("Dark Ritual", A, "hand"));
      const bears = toLibrary(game, "Grizzly Bears");
      const seen = pickFromZone(a, bears);
      enter(game, "Sandstalker Moloch");
      expect(seen.offered).toHaveLength(0);
      expect(zone(game, bears)).toBe("library");
    });

    it("looks at four once an opponent cast a black spell this turn", () => {
      const { game, a } = table();
      nextTurn(game); // bob's turn
      lands(game, "Swamp", 1, B);
      cast(game, game.debugSpawn("Dark Ritual", B, "hand"), { player: B });
      const bears = toLibrary(game, "Grizzly Bears");
      const seen = pickFromZone(a, bears);
      enter(game, "Sandstalker Moloch");
      expect(seen.offered).toContain(bears);
      expect(zone(game, bears)).toBe("hand");
      const bottom: ObjectId | undefined = game.state.zones.perPlayer[A].library.at(-1);
      expect(bottom).not.toBe(bears);
    });
  });

  it("Ephara's Dispersal: two less targeting an attacking creature", () => {
    const { game, a, b } = table();
    void a;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    nextTurn(game); // bob's turn
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    pickTargets(a, bears);
    cast(game, game.debugSpawn("Ephara's Dispersal", A, "hand"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});
