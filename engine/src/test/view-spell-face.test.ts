/**
 * An adventurer's Adventure and an omen card's Omen in a view
 * (`VisibleObject.spellFace`): the other spell the card can be cast as, which
 * the printed card shows beside its creature, while it isn't on the
 * battlefield — a hand's Smaug, the Great Calamity showed only "Flying"
 * (a bug report, 2026-10-04).
 */

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const setUp = () => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    decks: [
      { player: A, cards: Array<string>(40).fill("Mountain") },
      { player: B, cards: Array<string>(40).fill("Mountain") },
    ],
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  return game;
};

describe("an Adventure or Omen half in a view", () => {
  it("shows Smaug's Adventure in hand, and not once Smaug is on the battlefield", () => {
    const game = setUp();
    const inHand = game.debugSpawn("Smaug, the Great Calamity", A, "hand");
    const onBoard = game.debugSpawn("Smaug, the Great Calamity", A, "battlefield");
    const view = game.viewFor(A);
    expect(view.objects[inHand].spellFace).toMatchObject({ name: "Spew Flame", manaCost: "{4}{R}", types: ["sorcery"], subtypes: ["Adventure"] });
    expect(view.objects[inHand].spellFace?.text.length).toBeGreaterThan(0);
    expect(view.objects[onBoard].spellFace).toBeUndefined();
  });

  it("shows an omen card's Omen", () => {
    const game = setUp();
    const inHand = game.debugSpawn("Bloomvine Regent", A, "hand");
    const view = game.viewFor(A);
    expect(view.objects[inHand].spellFace?.name).toBe("Claim Territory");
  });

  it("gives an ordinary card none, and an opponent's hidden hand nothing to read", () => {
    const game = setUp();
    const bears = game.debugSpawn("Grizzly Bears", A, "hand");
    const theirs = game.debugSpawn("Smaug, the Great Calamity", B, "hand");
    const view = game.viewFor(A);
    expect(view.objects[bears].spellFace).toBeUndefined();
    expect(view.objects[theirs]).toBeUndefined();
  });
});

// Rule 722.1-722.2: the prepare spell is printed in an inset frame of the
// card's one face, and a hand's Studious First-Year showed only "This
// creature enters prepared" (a bug report, 2026-11-18).
describe("a preparation card's prepare spell in a view", () => {
  it("shows it in hand, in a graveyard and on the battlefield, where it's what a prepared one casts", () => {
    const game = setUp();
    const inHand = game.debugSpawn("Studious First-Year", A, "hand");
    const inYard = game.debugSpawn("Studious First-Year", A, "graveyard");
    const onBoard = game.debugSpawn("Studious First-Year", A, "battlefield");
    const view = game.viewFor(A);
    expect(view.objects[inHand].spellFace).toMatchObject({ name: "Rampant Growth", manaCost: "{1}{G}", types: ["sorcery"], subtypes: [] });
    expect(view.objects[inHand].spellFace?.text).toMatch(/^Search your library for a basic land card/);
    expect(view.objects[inYard].spellFace?.name).toBe("Rampant Growth");
    expect(view.objects[onBoard].spellFace?.name).toBe("Rampant Growth");
    // An opponent reads the same on what they can see.
    expect(game.viewFor(B).objects[onBoard].spellFace?.name).toBe("Rampant Growth");
  });

  it("shows it on a token copy too (rule 722.2b), and not on the spell's own copy in exile", () => {
    const game = setUp();
    const year = game.debugSpawn("Studious First-Year", A, "battlefield");
    game.debugApplyEffect(A, { kind: "become-prepared", target: 0 }, [{ kind: "object", object: year }]);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [{ kind: "object", object: year }]);
    const view = game.viewFor(A);
    const token = Object.values(view.objects).find((o) => o.cardName === "Studious First-Year" && o.isToken);
    expect(token?.spellFace?.name).toBe("Rampant Growth");
    const copy = view.objects[year].preparedSpell;
    expect(copy).toBeDefined();
    expect(view.objects[copy!].cardName).toBe("Rampant Growth");
    expect(view.objects[copy!].spellFace).toBeUndefined();
  });

  it("gives a face-down one none", () => {
    const game = setUp();
    const year = game.debugSpawn("Studious First-Year", A, "battlefield");
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [{ kind: "object", object: year }]);
    expect(game.state.objects[year].faceDown).toBeDefined();
    expect(game.viewFor(A).objects[year].spellFace).toBeUndefined();
  });
});
