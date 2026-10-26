/**
 * Lorwyn block's clash (rule 701.30) and champion (rule 702.72): the `clash`
 * effect — choose an opponent, both reveal, each in APNAP order leaves their
 * card on top or puts it on the bottom, the higher mana value wins — and the
 * `champion` helper's two linked triggers.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Answer every mode question by its text: `bottom` puts a clashed card on
 * the bottom; any other question takes its first mode. */
function clashAnswers(seat: ScriptedController, bottom: boolean): void {
  seat.chooseModesFn = (_view, min, _max, texts) => {
    const at = texts.findIndex((t) => t.startsWith(bottom ? "Put it on the bottom" : "Leave it on top"));
    return at >= 0 ? [at] : Array.from({ length: Math.max(min, 1) }, (_u, i) => i);
  };
}

describe("clash (rule 701.30)", () => {
  it("wins with the higher mana value: Paperfin Rascal gets its counter", () => {
    const { game } = table();
    toLibrary(game, "Hill Giant", A); // mana value 4
    toLibrary(game, "Wastes", B); // 0
    const rascal = enter(game, "Paperfin Rascal");
    expect(counters(game, rascal)).toBe(1);
  });

  it("loses on a tie or a lower card, and each player chooses where their card goes", () => {
    const { game, a, b } = table();
    const mine = toLibrary(game, "Wastes", A);
    const theirs = toLibrary(game, "Hill Giant", B);
    clashAnswers(a, true);
    clashAnswers(b, false);
    const rascal = enter(game, "Paperfin Rascal");
    expect(counters(game, rascal)).toBe(0);
    expect(library(game, A).at(-1)).toBe(mine);
    expect(library(game, B)[0]).toBe(theirs);
  });

  it("an empty library reveals nothing, and loses to any card", () => {
    const { game } = table();
    game.state.zones.perPlayer[B].library.length = 0;
    toLibrary(game, "Wastes", A);
    const rascal = enter(game, "Paperfin Rascal");
    expect(counters(game, rascal)).toBe(1);
  });

  it("asks which opponent among several (701.30b)", () => {
    const { game, a } = table({ players: 3 });
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    const carols = toLibrary(game, "Hill Giant", C);
    let asked: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      if (texts.some((t) => t.startsWith("Clash with"))) {
        asked = texts;
        return [texts.findIndex((t) => t === "Clash with Carol")];
      }
      return [0];
    };
    const rascal = enter(game, "Paperfin Rascal");
    expect(asked).toEqual(["Clash with Bob", "Clash with Carol"]);
    // A tie with Carol's Hill Giant isn't a win.
    expect(counters(game, rascal)).toBe(0);
    expect(library(game, C)[0]).toBe(carols);
  });

  it("a loss names the opponent clashed with: Captivating Glance gives them the creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const glance = toHand(game, "Captivating Glance", A);
    lands(game, "Island", 3, A);
    cast(game, glance, { targets: [ref(bear)] });
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    toStep(game, "end");
    settle(game);
    expect(controller(game, bear)).toBe(B);
  });

  it("\"repeat this process\" goes on until a clash is lost: Hoarder's Greed", () => {
    const { game } = table();
    // Top to bottom: two cards drawn, the Giant revealed (a win, left on
    // top), then drawn with the next card, and Wastes revealed (a tie).
    for (const card of ["Wastes", "Wastes", "Hill Giant", "Wastes", "Wastes"]) toLibrary(game, card, A);
    const greed = toHand(game, "Hoarder's Greed", A);
    lands(game, "Swamp", 4, A);
    const before = hand(game, A).length;
    cast(game, greed);
    expect(life(game, A)).toBe(16);
    expect(hand(game, A).length).toBe(before - 1 + 4);
  });

  it("the mill is the spell's controller's: Broken Ambitions", () => {
    const { game } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    const ambitions = toHand(game, "Broken Ambitions", A);
    lands(game, "Island", 1, A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, ambitions, { targets: [ref(bolt)], x: 0 });
    expect(zone(game, bolt)).toBe("graveyard");
    // Bolt plus the four milled cards.
    expect(graveyard(game, B).length).toBe(5);
  });
});

describe("a spell returning itself to its owner's hand (rule 608.2n)", () => {
  it("on a win, Research the Deep goes to hand as it finishes resolving; on a loss, to the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4, A);
    const research = toHand(game, "Research the Deep", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Wastes", B);
    // Alice draws Wastes, then reveals the Hill Giant: a win.
    cast(game, research);
    expect(zone(game, research)).toBe("hand");
    expect(graveyard(game, A)).not.toContain(research);
    // Bob's Hill Giant now beats her Wastes: it goes to the graveyard.
    toLibrary(game, "Hill Giant", B);
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Wastes", A);
    cast(game, research);
    expect(zone(game, research)).toBe("graveyard");
  });

  it("champion over either of two types: Lightning Crafter takes a Shaman", () => {
    const { game, a } = table();
    const shaman = spawn(game, "Smokebraider", A);
    pickModes(a, 0);
    pickPermanents(a, shaman);
    const crafter = enter(game, "Lightning Crafter");
    expect(zone(game, crafter)).toBe("battlefield");
    expect(zone(game, shaman)).toBe("exile");
  });
});

describe("champion (rule 702.72)", () => {
  it("exiles another of its kind, and returns it when it leaves", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    pickModes(a, 0);
    pickPermanents(a, bear);
    const hero = enter(game, "Changeling Hero");
    expect(zone(game, hero)).toBe("battlefield");
    expect(zone(game, bear)).toBe("exile");
    destroy(game, hero);
    settle(game);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });

  it("is sacrificed when its controller declines, or has nothing to exile", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", A);
    pickModes(a);
    const hero = enter(game, "Changeling Hero");
    expect(zone(game, hero)).toBe("graveyard");
    const { game: empty } = table();
    expect(zone(empty, enter(empty, "Nova Chaser"))).toBe("graveyard");
  });

  it("only another of the named kind: a changeling is one", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const shifter = spawn(game, "Woodland Changeling", A);
    pickModes(a, 0);
    const offered = pickPermanents(a, shifter);
    const chaser = enter(game, "Nova Chaser");
    expect(offered.offered).toEqual([shifter]);
    expect(zone(game, chaser)).toBe("battlefield");
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Mistbind Clique taps the lands of the player its championing targets", () => {
    const { game, a } = table();
    const faerie = spawn(game, "Spellstutter Sprite", A);
    const bobs = lands(game, "Forest", 3, B);
    pickModes(a, 0);
    pickPermanents(a, faerie);
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Mistbind Clique");
    expect(zone(game, faerie)).toBe("exile");
    expect(bobs.every((id) => game.state.objects[id].tapped === true)).toBe(true);
  });
});
